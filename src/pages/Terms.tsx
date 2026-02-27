import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, CreditCard, AlertTriangle, Shield, Scale, Ban, Building, UserCheck, MessageSquare, DollarSign, AlertCircle, Gavel, ShieldX, UserX, Globe, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const summaryCards = [
  {
    icon: Building,
    title: "What Courial Is",
    description: "We're a technology platform, not a delivery company or taxi operator. Independent Courials and Chauffeurs handle your deliveries and rides.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Prices vary by time, location, and demand. Payments are processed securely. Most charges are non-refundable.",
  },
  {
    icon: AlertTriangle,
    title: "Risks",
    description: "Deliveries and rides have risks (accidents, delays, damages). For motorcycle rides in Thailand, risks are higher—always wear a helmet.",
  },
  {
    icon: Shield,
    title: "Liability",
    description: "Courial isn't responsible for accidents, damages, or delays caused by providers. Our liability is limited to what you paid in the last 6 months.",
  },
  {
    icon: Scale,
    title: "Disputes",
    description: "U.S. disputes are handled in California. Thailand disputes are handled under Thai law. No class actions—issues must be resolved individually.",
  },
  {
    icon: Ban,
    title: "Breaking the Rules",
    description: "If you misuse the app or break laws, Courial can suspend or terminate your account.",
  },
  {
    icon: Shield,
    title: "Delivery Protection",
    description: "Built-in protection for eligible deliveries, with optional Extended Protection for higher-value items. Claims must follow stated procedures and deadlines.",
  },
];

const Terms = () => {
  const effectiveYear = useMemo(() => {
    const now = new Date();
    return now.getFullYear();
  }, []);

  const effectiveDate = `January 1, ${effectiveYear}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground">
              Effective: {effectiveDate}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Summary Cards Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              Quick Summary
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Here's what you need to know at a glance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group rounded-2xl glass-card p-8 transition-all duration-300 hover:border-primary/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-muted/80 transition-colors">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground">{card.description}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto mt-12"
          >
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-muted-foreground italic">
                Note: This summary is for convenience. If there's ever a conflict, the full Terms of Service below control.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Legal Terms */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              Full Legal Terms
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete binding agreement.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card rounded-3xl overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <div className="p-8 md:p-12 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">1. Definitions</h3>
                    <div className="text-muted-foreground leading-relaxed space-y-3">
                      <p><strong className="text-foreground">Courial:</strong> Courial, Inc., a Delaware corporation, including Courial (Thailand) Co., Ltd. Courial operates a technology platform connecting Users with independent Providers.</p>
                      <p><strong className="text-foreground">Services:</strong> Includes Delivery Services (U.S.) and Transportation Services (Thailand).</p>
                      <p><strong className="text-foreground">Providers:</strong> Independent contractors (Courials for delivery, Chauffeurs for transportation).</p>
                      <p><strong className="text-foreground">Users:</strong> Individuals or entities using the Services.</p>
                      <p>Courial is not a carrier, employer, or transportation provider.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">2. Acceptance of Terms</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      By using our Services, you agree to this Agreement. If you do not agree, do not use Courial.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">3. Modifications</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial may update these Terms at any time. Updates are effective upon posting. Continued use means acceptance.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">4. Additional Policies</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your use is also governed by our Privacy Policy and any required notices under U.S. or Thai law.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">5. User Conduct</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">You agree to:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Use the Services lawfully and comply with U.S. and Thai regulations.</li>
                      <li>• Provide accurate information and maintain account security.</li>
                      <li>• Not misuse promotions or disrupt the platform.</li>
                      <li>• Follow safety rules (helmets in Thailand for motos, seatbelts in cars).</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Violation may result in suspension or termination.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">6. Provider Responsibilities</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">Providers are independent contractors. They must:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Maintain proper licenses and permits.</li>
                      <li>• Carry liability and commercial auto insurance meeting or exceeding legal requirements.</li>
                      <li>• Ensure vehicles are safe and roadworthy.</li>
                      <li>• Pay their own taxes and costs.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Courial does not provide insurance or assume liability for Providers' actions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">7. Account Management</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Users must keep credentials secure. Courial is not liable for unauthorized account use due to user negligence.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">8. Content & Communications</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• User-generated content may be used by Courial under a worldwide, royalty-free license.</li>
                      <li>• By creating an account, you consent to electronic communications from Courial.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">9. Payments</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• All payments are processed by third-party providers.</li>
                      <li>• Charges are non-refundable unless stated otherwise.</li>
                      <li>• Prices vary by location and demand.</li>
                      <li>• Users authorize Courial to charge stored payment methods.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">10. Risk Acknowledgment</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">Users assume all risks, including:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Delivery delays, loss, or damage.</li>
                      <li>• Transportation accidents or injuries.</li>
                      <li>• Motorcycle transport in Thailand carries heightened risks.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">11. Dispute Resolution</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• <strong className="text-foreground">U.S. Users:</strong> Binding arbitration under AAA rules (California law). Opt-out within 30 days.</li>
                      <li>• <strong className="text-foreground">Thailand Users:</strong> Binding arbitration under THAC rules (Thai law). Opt-out within 30 days.</li>
                      <li>• Class actions are waived.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">12. Limitation of Liability</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial is not liable for indirect or consequential damages. Aggregate liability is capped at the total fees paid in the 6 months before a claim.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">13. Indemnification</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You agree to indemnify Courial for claims, damages, or losses arising from your use, violation of laws, or interactions with Providers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">14. Termination</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial may suspend or terminate accounts without notice. Certain provisions (indemnity, limitations) survive termination.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">15. Governing Law</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• <strong className="text-foreground">United States:</strong> Governed by California law. Exclusive jurisdiction in San Francisco courts.</li>
                      <li>• <strong className="text-foreground">Thailand:</strong> Governed by Thai law. Exclusive jurisdiction in Bangkok courts.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">16. Reporting Violations</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Contact: <a href="mailto:support@courial.com" className="text-primary hover:underline">support@courial.com</a>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">17. Delivery Protection & Coverage</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial provides built-in protection and optional Extended Protection for eligible deliveries as outlined in the Courial Delivery Protection & Coverage Policy, which is incorporated into these Terms by reference.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">The Delivery Protection & Coverage Policy describes:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Complimentary protection included with eligible deliveries</li>
                      <li>• How declared value is defined and applied</li>
                      <li>• Optional Extended Protection for items exceeding $100 in declared value</li>
                      <li>• Packaging and verification requirements</li>
                      <li>• Coverage limits and exclusions</li>
                      <li>• Claims procedures and deadlines</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      By booking a delivery through the Courial platform, you acknowledge and agree that any reimbursement eligibility, coverage limits, exclusions, or documentation requirements are governed exclusively by the Delivery Protection & Coverage Policy in effect at the time of booking.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      If there is any conflict between a customer's expectations and the stated Protection Policy, the Protection Policy controls.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial reserves the right to modify protection limits, eligibility requirements, or verification procedures at any time, with updated terms posted on the website or in the app.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">18. Declared Value</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      At the time of booking, you may be required to state the declared value of the item being transported.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">You agree that:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• The declared value must reflect the reasonable, verifiable market value of the item.</li>
                      <li>• Proof of value may be required for items exceeding $100 in declared value.</li>
                      <li>• Courial may decline Extended Protection if sufficient documentation is not provided.</li>
                      <li>• Misrepresentation of value may result in denial of claims and suspension of account access.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      Declared value does not automatically entitle a customer to reimbursement. Coverage is subject to eligibility, compliance with packaging standards, and the limitations set forth in the Delivery Protection & Coverage Policy.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">19. Packaging & Verification</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You are responsible for ensuring that all items are properly packaged and suitable for safe transport.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">For deliveries seeking Extended Protection:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Items must be presented to the Courial prior to packaging.</li>
                      <li>• Items must be packaged in the presence of the Courial before sealing.</li>
                      <li>• Courial may document item condition and packaging through photographs.</li>
                      <li>• Failure to comply with these requirements may void eligibility for Extended Protection.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial reserves the right to refuse any item deemed improperly packaged, unsafe, illegal, or high-risk.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">20. Claims</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All claims for loss or damage must be submitted in accordance with the timelines and documentation requirements outlined in the Delivery Protection & Coverage Policy.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Failure to submit a claim within the required timeframe may result in denial of reimbursement eligibility.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial may investigate all claims using delivery records, courier documentation, GPS logs, and photographic evidence.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">21. Limitation of Liability (Deliveries)</h3>
                    <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by applicable law:</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial's maximum liability for any claim arising from loss of or damage to an item during transit shall not exceed:
                    </p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• The approved declared value covered under the applicable protection tier selected at booking; or</li>
                      <li>• The complimentary protection amount in effect at the time of booking if no Extended Protection was purchased.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">Under no circumstances shall Courial be liable for:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Indirect, incidental, consequential, punitive, or special damages</li>
                      <li>• Lost profits, lost revenue, or loss of business opportunity</li>
                      <li>• Emotional or sentimental value</li>
                      <li>• Pre-existing damage</li>
                      <li>• Improperly packaged items</li>
                      <li>• Restricted or prohibited items</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      In no event shall Courial's total aggregate liability exceed $2,500 per delivery unless expressly agreed to in writing prior to pickup.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      These limitations apply regardless of the legal theory asserted, whether in contract, tort, negligence, strict liability, or otherwise.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">22. Incorporation of Protection Policy</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The Courial Delivery Protection & Coverage Policy is hereby incorporated by reference into these Terms of Service. By using the platform, you agree to be bound by that policy in addition to these Terms.
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="border-t border-border pt-10 mt-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Courial, Inc.</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          650 California Street<br />
                          San Francisco, CA 94108<br />
                          <a href="mailto:support@courial.com" className="text-primary hover:underline">support@courial.com</a>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Courial Co., Ltd.</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          <a href="mailto:support@courial.com" className="text-primary hover:underline">support@courial.com</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
