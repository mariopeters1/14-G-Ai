"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Prototype",
    price: "Free",
    description: "For small teams testing the waters.",
    features: ["Smart Menu Generation", "Basic Inventory", "1 Location"],
  },
  {
    name: "Pilot",
    price: "Custom",
    description: "For growing restaurants ready to scale.",
    features: ["All Prototype features", "Live Dashboard", "Wearable Integration", "Priority Support"],
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "Let's Talk",
    description: "For large-scale operations and chains.",
    features: ["All Pilot features", "Multi-location Sync", "Dedicated Account Manager", "API Access"],
  },
];

export default function Plans() {
  return (
    <section id="plans" className="relative py-24 bg-background overflow-hidden">
      <div className="absolute bottom-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">
            Partnerships
          </div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl lg:text-6xl text-white">
            Find the Perfect Fit
          </h2>
          <p className="max-w-[700px] text-white/60 text-lg md:text-xl font-light mt-4">
            Join our exclusive waitlist to secure lifetime pilot rates as a founding partner.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-md gap-8 lg:max-w-5xl lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="h-full"
            >
              <div
                className="relative flex flex-col h-full rounded-2xl border transition-all duration-500 overflow-hidden group"
                style={{
                  backgroundColor: plan.isPopular ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                  borderColor: plan.isPopular ? "rgba(212,163,115,0.5)" : "rgba(255,255,255,0.1)",
                  boxShadow: plan.isPopular ? "0 0 30px rgba(212,163,115,0.15)" : "none",
                  transform: plan.isPopular ? "scale(1.05)" : "scale(1)",
                  zIndex: plan.isPopular ? 10 : 1,
                }}
              >
                {/* Popular gradient overlay */}
                {plan.isPopular && (
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                )}

                {/* Popular badge */}
                {plan.isPopular && (
                  <div
                    className="text-center py-2 px-4 font-bold text-sm tracking-widest uppercase"
                    style={{
                      background: "linear-gradient(to right, #D4A373, #C9956C)",
                      color: "#0A0A0F",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="relative z-10 text-center pb-8 pt-8 px-6">
                  <h3 className="font-headline text-2xl text-white">{plan.name}</h3>
                  <p className="text-white/60 mt-2 text-sm">{plan.description}</p>
                  <div
                    className="text-5xl font-bold pt-6 tracking-tight"
                    style={{
                      color: plan.isPopular ? "#D4A373" : "#fff",
                      textShadow: plan.isPopular ? "0 0 15px rgba(212,163,115,0.5)" : "none",
                    }}
                  >
                    {plan.price}
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 relative z-10 px-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className="h-5 w-5 mt-0.5 flex-shrink-0"
                          style={{ color: plan.isPopular ? "#D4A373" : "rgba(255,255,255,0.4)" }}
                        />
                        <span className="text-white/80 font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="relative z-10 pt-8 pb-8 px-8">
                  <Link
                    href="#contact-us"
                    className="flex items-center justify-center w-full h-14 text-lg rounded-full transition-all duration-300 font-medium"
                    style={
                      plan.isPopular
                        ? {
                            backgroundColor: "#D4A373",
                            color: "#0A0A0F",
                            boxShadow: "0 0 20px rgba(212,163,115,0.3)",
                          }
                        : {
                            backgroundColor: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                    }
                  >
                    Join Waitlist
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
