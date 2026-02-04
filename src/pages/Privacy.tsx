import { useMemo } from "react";
import { motion } from "framer-motion";
import { UserCheck, CreditCard, Shield, Share2, Lock, Clock, FileCheck, Globe, Baby, RefreshCw, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const summaryCards = [
  {
    icon: UserCheck,
    title: "What We Collect",
    description: "Personal info, payment details, location data, usage patterns, and communications to provide and improve our services.",
  },
  {
    icon: Shield,
    title: "How We Use It",
    description: "To match you with Courials/Chauffeurs, process payments, ensure safety, communicate updates, and comply with laws.",
  },
  {
    icon: Share2,
    title: "Who We Share With",
    description: "Only with providers completing your orders, service partners, and when legally required. We never sell your data.",
  },
  {
    icon: Lock,
    title: "Data Security",
    description: "We use encryption, access controls, and monitoring to protect your information, though no system is 100% secure.",
  },
  {
    icon: FileCheck,
    title: "Your Rights",
    description: "Access, correct, delete, or transfer your data. Opt out of marketing anytime by emailing privacy@courial.com.",
  },
  {
    icon: Globe,
    title: "International Transfers",
    description: "Your data may move between U.S. and Thailand with safeguards complying with GDPR, CCPA, and Thai PDPA.",
  },
];

const Privacy = () => {
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
              Privacy Policy
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
              How we handle your data at a glance.
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
                This summary is for convenience. The full Privacy Policy below governs how we handle your data.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Privacy Policy */}
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
              Full Privacy Policy
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete details on how we protect your privacy.
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
                    <h3 className="text-xl font-semibold text-foreground">1. Introduction</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial, Inc. and its subsidiaries, including Courial (Thailand) Co., Ltd. ("Courial," "we," "our," or "us"), are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile applications, or engage with our Services (delivery in the U.S. and transportation in Thailand).
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By using Courial, you consent to the practices described here. This policy works together with our Terms of Service.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">2. Information We Collect</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">We may collect the following categories of personal data:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-3">
                      <li><strong className="text-foreground">Personal Identification Information:</strong> Name, email, phone number, postal address, government-issued IDs (if legally required for age-restricted deliveries).</li>
                      <li><strong className="text-foreground">Account Information:</strong> Username, password, profile details, verification data.</li>
                      <li><strong className="text-foreground">Payment Information:</strong> Credit/debit card details, billing info (processed via secure third-party providers).</li>
                      <li><strong className="text-foreground">Location Data:</strong> Geolocation information when using delivery or ride services.</li>
                      <li><strong className="text-foreground">Usage Data:</strong> Order history, ride history, preferences, in-app interactions, logs, IP addresses.</li>
                      <li><strong className="text-foreground">Device Information:</strong> Device identifiers, operating system, app version, browser type.</li>
                      <li><strong className="text-foreground">User-Generated Content:</strong> Reviews, ratings, feedback, and uploaded materials.</li>
                      <li><strong className="text-foreground">Communications:</strong> Emails, SMS, in-app notifications, and responses with Courial.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">We use your information for:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-3">
                      <li><strong className="text-foreground">Service Delivery:</strong> Matching you with independent Providers (Courials/Chauffeurs).</li>
                      <li><strong className="text-foreground">Transactions:</strong> Processing payments, tips, surcharges, refunds, and receipts.</li>
                      <li><strong className="text-foreground">Safety & Compliance:</strong> Verifying identities, enforcing safety standards (e.g., helmets, seatbelts), and complying with Thai and U.S. regulations.</li>
                      <li><strong className="text-foreground">Communication:</strong> Sending confirmations, updates, promotions, and policy changes.</li>
                      <li><strong className="text-foreground">Improvement:</strong> Analyzing patterns to enhance our platform, safety, and reliability.</li>
                      <li><strong className="text-foreground">Legal Requirements:</strong> Meeting obligations under U.S. and Thai law, including recordkeeping.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">4. Sharing Your Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">We may share your data with:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-3">
                      <li><strong className="text-foreground">Independent Providers (Courials/Chauffeurs):</strong> Limited details necessary to complete your delivery or ride.</li>
                      <li><strong className="text-foreground">Service Providers:</strong> Third parties supporting payments, hosting, analytics, marketing, and customer support.</li>
                      <li><strong className="text-foreground">Business Partners:</strong> Partners that integrate with Courial or co-offer promotions.</li>
                      <li><strong className="text-foreground">Legal & Regulatory Authorities:</strong> When required to comply with laws, investigations, or government requests.</li>
                      <li><strong className="text-foreground">Affiliates:</strong> Our subsidiaries and affiliates for internal operations.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4 font-medium">
                      We do not sell your personal information.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">5. Data Security</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We apply reasonable technical and organizational safeguards (encryption, access controls, monitoring) to protect your data. However, no method of transmission is 100% secure.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">6. Data Retention</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We retain your data as long as needed for service provision, legal compliance, dispute resolution, and fraud prevention. Data may be anonymized for analytics after retention ends.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">7. Your Rights</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">Depending on your location (U.S., EU, Thailand, or elsewhere), you may have rights to:</p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li><strong className="text-foreground">Access:</strong> Obtain a copy of your data.</li>
                      <li><strong className="text-foreground">Correction:</strong> Update inaccurate information.</li>
                      <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data (subject to legal obligations).</li>
                      <li><strong className="text-foreground">Restriction/Objection:</strong> Limit or object to processing.</li>
                      <li><strong className="text-foreground">Portability:</strong> Request transfer of your data to another provider.</li>
                      <li><strong className="text-foreground">Marketing Opt-Out:</strong> Manage your preferences for promotional communications.</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      To exercise these rights, email us at <a href="mailto:privacy@courial.com" className="text-primary hover:underline">privacy@courial.com</a>.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">8. International Data Transfers</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your data may be transferred across borders (e.g., between the U.S. and Thailand). We ensure such transfers comply with applicable laws (e.g., GDPR, CCPA, Thai PDPA) through contractual safeguards.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">9. Children's Privacy</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Courial's Services are not directed to children under 13 in the U.S. or under personal data protection age thresholds in other regions (e.g., 20 in Thailand for contracts). We do not knowingly collect data from minors without parental/guardian consent.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">10. Changes to This Privacy Policy</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update this policy periodically. Changes are effective upon posting. Users will be notified via email, app notification, or website updates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">11. Contact Us</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      For questions about this policy or your data rights, contact us below.
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="border-t border-border pt-10 mt-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Courial, Inc.</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          650 California Street<br />
                          San Francisco, CA 94108, USA<br />
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
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-muted-foreground text-sm">
                        <strong className="text-foreground">Dedicated Privacy Contact:</strong>{" "}
                        <a href="mailto:privacy@courial.com" className="text-primary hover:underline">privacy@courial.com</a>
                      </p>
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

export default Privacy;
