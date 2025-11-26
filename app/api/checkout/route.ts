import { NextRequest } from "next/server";
// Stripe is lazy-loaded only when a secret key is configured to avoid bundling.
import fs from "fs";
import path from "path";

// Define types for request and product
interface CartItemReq {
  id: string; // product id
  sku?: string; // optional specific variant sku
  size?: string; // optional variant size
  qty: number;
}
interface CheckoutMeta {
  countryCode?: string; // e.g., "CH"
  inServiceArea?: boolean;
}

interface ProductVariant {
  size: string;
  price: number; // in USD for simplicity; use cents in production
  sku: string;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

function loadCatalog(): { products: Product[] } {
  const filePath = path.join(process.cwd(), "app", "data", "products.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function findVariant(product: Product, sku?: string, size?: string): ProductVariant | null {
  if (sku) {
    const v = product.variants.find(x => x.sku === sku);
    if (v) return v;
  }
  if (size) {
    const v = product.variants.find(x => x.size === size);
    if (v) return v;
  }
  return product.variants[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartItemReq[] = Array.isArray(body?.items) ? body.items : [];
    const meta: CheckoutMeta = body?.meta || {};
    if (!items.length) {
      return new Response(JSON.stringify({ error: "Empty cart" }), { status: 400 });
    }

    const catalog = loadCatalog();
    const lineItems = [] as Array<{ name: string; sku: string; unit_amount_cents: number; qty: number }>;
    let subtotalCents = 0;

    for (const item of items) {
      if (!item || typeof item.qty !== "number" || item.qty <= 0) continue;
      const product = catalog.products.find(p => p.id === item.id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Unknown product id: ${item.id}` }), { status: 400 });
      }
      const variant = findVariant(product, item.sku, item.size);
      if (!variant) {
        return new Response(JSON.stringify({ error: `Unknown variant for product: ${item.id}` }), { status: 400 });
      }
      const unitCents = Math.round(variant.price * 100);
      subtotalCents += unitCents * item.qty;
      lineItems.push({ name: product.name + " " + variant.size, sku: variant.sku, unit_amount_cents: unitCents, qty: item.qty });
    }

    // CHF tax/shipping based on country
    const isCH = (meta.countryCode || "").toUpperCase() === "CH";
    // Enforce Geneva-only service area
    if (!isCH || !meta.inServiceArea) {
      return new Response(JSON.stringify({ error: "We currently serve the Geneva area in Switzerland only." }), { status: 400 });
    }
    const taxRate = 0.081; // Swiss VAT
    const shippingCents = isCH ? 700 : 2000; // flat-rate example in cents
    const taxCents = Math.round(subtotalCents * taxRate);
    const totalCents = subtotalCents + taxCents + shippingCents;

    // Create Stripe Checkout Session if key configured; else return mock url
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      try {
        const { default: StripeLib } = await import("stripe");
        const stripe = new StripeLib(key, { apiVersion: "2024-11-20" } as any);
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          currency: "chf",
          line_items: lineItems.map((li) => ({
            quantity: li.qty,
            price_data: {
              currency: "chf",
              unit_amount: li.unit_amount_cents,
              product_data: { name: li.name },
            },
          })),
          shipping_options: [{ shipping_rate_data: { display_name: "Standard", fixed_amount: { amount: shippingCents, currency: "chf" }, type: "fixed_amount" } }],
          custom_text: { submit: { message: "Vital Coffee Roasters" } },
          success_url: process.env.CHECKOUT_SUCCESS_URL || "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: process.env.CHECKOUT_CANCEL_URL || "http://localhost:3000/cancel",
        });
        return new Response(JSON.stringify({ currency: "CHF", lineItems, subtotalCents, taxCents, shippingCents, totalCents, url: session.url }), { status: 200 });
      } catch (e) {
        // Fallback to mock if Stripe fails to initialize
      }
    }

    const checkoutUrl = `/checkout/mock?currency=CHF&subtotal=${subtotalCents}&tax=${taxCents}&shipping=${shippingCents}&total=${totalCents}`;
    return new Response(JSON.stringify({ currency: "CHF", lineItems, subtotalCents, taxCents, shippingCents, totalCents, url: checkoutUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
