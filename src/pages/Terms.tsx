import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
  // Automatically updates to current year on January 1st
  const effectiveYear = useMemo(() => {
    const now = new Date();
    return now.getFullYear();
  }, []);

  const effectiveDate = `January 1, ${effectiveYear}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground text-lg">
                Effective: {effectiveDate}
              </p>
            </div>

            {/* Scrollable Content Card */}
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <div className="p-8 md:p-12 space-y-10">
                  {/* Summary Section */}
                  <section className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">What Courial Is</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We're a technology platform, not a delivery company or taxi operator. Independent Courials and Chauffeurs handle your deliveries and rides.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Payments</h2>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• Prices vary by time, location, and demand.</li>
                        <li>• Payments are processed securely.</li>
                        <li>• Most charges are non-refundable.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Risks</h2>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• Deliveries and rides have risks (accidents, delays, damages).</li>
                        <li>• For motorcycle rides in Thailand, risks are higher—always wear a helmet.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Liability</h2>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• Courial isn't responsible for accidents, damages, or delays caused by providers.</li>
                        <li>• Our liability is limited to what you paid in the last 6 months.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Disputes</h2>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• U.S. disputes are handled in California.</li>
                        <li>• Thailand disputes are handled under Thai law.</li>
                        <li>• No class actions—issues must be resolved individually.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Breaking the Rules</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        If you misuse the app or break laws, Courial can suspend or terminate your account.
                      </p>
                    </div>

                    <div className="bg-muted/50 border border-border rounded-xl p-6">
                      <p className="text-sm text-muted-foreground italic">
                        Note: This summary is for convenience. If there's ever a conflict, the full Terms of Service below control.
                      </p>
                    </div>
                  </section>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Full Legal Terms */}
                  <section className="space-y-8">
                    <h2 className="text-3xl font-bold text-foreground">
                      Full Legal Terms of Service <span className="text-muted-foreground font-normal text-lg">(Binding Agreement)</span>
                    </h2>

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
                  </section>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Contact Info */}
                  <section className="space-y-6">
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
                  </section>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
