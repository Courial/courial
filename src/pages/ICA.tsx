import { useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, Car, DollarSign, Users, Shield, Wrench, UserCheck, FileWarning, Scale, XCircle, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

const summaryCards = [
  {
    icon: Briefcase,
    title: "Independent Business",
    description: "You operate your own enterprise. You choose when, where, and how to work—including for competitors.",
  },
  {
    icon: Car,
    title: "Your Equipment",
    description: "You provide your own vehicle, equipment, fuel, maintenance, insurance, and permits.",
  },
  {
    icon: DollarSign,
    title: "Compensation",
    description: "Courials retain 70-80% of delivery fees. Chauffeurs retain 80-90% of ride fees. You keep 100% of tips.",
  },
  {
    icon: Shield,
    title: "Insurance Required",
    description: "You must maintain legally required insurance. Courial does not provide workers' compensation.",
  },
  {
    icon: Scale,
    title: "Arbitration",
    description: "Disputes are resolved through individual arbitration. You may opt out within 30 days of signing.",
  },
  {
    icon: XCircle,
    title: "Termination",
    description: "You can terminate with 7 days' notice. Courial may deactivate for policy violations or fraud.",
  },
];

const ICA = () => {
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
              Independent Contractor Agreement
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
              Key points of the contractor relationship.
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
                This summary is for convenience. The full Independent Contractor Agreement below is the binding agreement.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Agreement */}
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
              Full Agreement
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The complete binding Independent Contractor Agreement.
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
                  {/* Preamble */}
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      This Agreement ("Agreement") is made and entered into by and between you, the undersigned contractor ("CONTRACTOR"), an independent contractor engaged in the business of performing the services contemplated by this Agreement, and Courial, Inc. ("COURIAL" or "COMPANY"). CONTRACTOR may enter this Agreement either as an individual or as a corporate entity. This Agreement will become effective on the date it is accepted regardless of whether you are eligible to, or ever do, perform any Contracted Services.
                    </p>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                    <p className="text-foreground font-semibold leading-relaxed">
                      IMPORTANT: PLEASE REVIEW THIS AGREEMENT CAREFULLY. IN PARTICULAR, PLEASE REVIEW THE MUTUAL ARBITRATION PROVISION IN SECTION IX, AS IT REQUIRES THE PARTIES (UNLESS YOU VALIDLY OPT OUT OF ARBITRATION, AS PROVIDED BELOW) TO RESOLVE DISPUTES ON AN INDIVIDUAL BASIS, TO THE FULLEST EXTENT PERMITTED BY LAW, THROUGH FINAL AND BINDING ARBITRATION.
                    </p>
                  </div>

                  {/* Recitals */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">RECITALS</h3>
                    <div className="text-muted-foreground leading-relaxed space-y-4">
                      <p>
                        COURIAL is a technology company that provides an online marketplace connection using web-based technology ("Courial Platform") to connect independent contractors with businesses and consumers. The Courial Platform enables registered users to request delivery, courier, and chauffeur services, which are then offered to contractors for fulfillment. COURIAL itself does not provide delivery or chauffeur services.
                      </p>
                      <p>
                        CONTRACTOR is an independent provider of such services, authorized to conduct the services contemplated by this Agreement in the geographic location(s) where CONTRACTOR operates, and possesses all necessary licenses, permits, vehicles, equipment, and personnel required by law.
                      </p>
                      <p>
                        CONTRACTOR desires to enter into this Agreement to receive delivery and chauffeur opportunities via the Courial Platform. CONTRACTOR expressly understands and agrees that he/she is not an employee of COURIAL and is engaged as an independent contractor.
                      </p>
                    </div>
                  </div>

                  {/* Section I */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">I. PURPOSE OF AGREEMENT</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      This Agreement governs the relationship between COURIAL and CONTRACTOR and establishes the parties' rights and obligations. Nothing in this Agreement shall guarantee CONTRACTOR any particular volume of business. CONTRACTOR is free to accept or reject any opportunity, and may perform services for other businesses, including Courial competitors.
                    </p>
                  </div>

                  {/* Section II */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">II. CONTRACTOR'S OPERATIONS</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• CONTRACTOR operates an independently established enterprise.</li>
                      <li>• CONTRACTOR determines the manner, method, and means of performing services, including pickup, delivery, routes, and schedules.</li>
                      <li>• CONTRACTOR is solely responsible for compliance with all applicable laws, permits, and licenses.</li>
                      <li>• CONTRACTOR is not required to wear uniforms, display Courial branding, or report to supervisors.</li>
                    </ul>
                  </div>

                  {/* Section III */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">III. CONTRACTED SERVICES</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      From time to time, CONTRACTOR may be offered opportunities through the Courial Platform to complete:
                    </p>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• Delivery Services ("Courial Services")</li>
                      <li>• Chauffeur Services ("Chauffeur Services")</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      Each accepted opportunity ("Contracted Service") must be completed safely, lawfully, and in accordance with consumer specifications.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Failure to complete an accepted Contracted Service may result in forfeiture of payment, offsets, or account deactivation in accordance with Section IV.
                    </p>
                  </div>

                  {/* Section IV */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">IV. COMPENSATION & OFFSETS</h3>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium text-foreground">1. Compensation</h4>
                      <p className="text-muted-foreground leading-relaxed mb-2">CONTRACTOR will be compensated as follows:</p>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• <strong className="text-foreground">Courials (Delivery Partners):</strong> Contractor retains 70% of delivery fees and 100% of tips; 80% of delivery fees if using an EV.</li>
                        <li>• <strong className="text-foreground">Chauffeurs (Luxury Ride Partners):</strong> Contractor retains 80% of ride fees and 100% of tips; 90% of ride fees when using Company-approved highest luxury class vehicles (as designated by COURIAL).</li>
                      </ul>
                      <p className="text-muted-foreground leading-relaxed mt-3">
                        Payments will be processed weekly by COURIAL, unless otherwise agreed.
                      </p>
                    </div>

                    <div className="space-y-3 mt-6">
                      <h4 className="text-lg font-medium text-foreground">2. Offsets, Deductions, and Withholdings</h4>
                      <p className="text-muted-foreground leading-relaxed mb-2">COURIAL reserves the right to offset, deduct, or withhold compensation if CONTRACTOR engages in:</p>
                      <ul className="text-muted-foreground leading-relaxed space-y-2">
                        <li>• (a) verified damage to customer property caused by CONTRACTOR's negligence or misconduct;</li>
                        <li>• (b) fraud, misrepresentation, or chargebacks attributable to CONTRACTOR;</li>
                        <li>• (c) failure to complete an accepted Contracted Service resulting in costs to COURIAL;</li>
                        <li>• (d) violations of COURIAL's terms, policies, or codes of conduct that cause financial loss, reputational harm, or brand damage.</li>
                      </ul>
                      <p className="text-muted-foreground leading-relaxed mt-3">
                        Payments may be withheld pending investigation. Written notice of any offset will be provided, and CONTRACTOR may dispute within 10 business days.
                      </p>
                    </div>
                  </div>

                  {/* Section V */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">V. RELATIONSHIP OF PARTIES</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• CONTRACTOR and COURIAL are independent business enterprises.</li>
                      <li>• CONTRACTOR is not an employee, agent, joint venturer, or partner of COURIAL.</li>
                      <li>• CONTRACTOR is solely responsible for taxes, insurance, expenses, and personnel. COURIAL will issue IRS Form 1099 as applicable.</li>
                    </ul>
                  </div>

                  {/* Section VI */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">VI. EQUIPMENT & EXPENSES</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      CONTRACTOR must provide all equipment and vehicles necessary for services. CONTRACTOR bears all costs of operation, including fuel, maintenance, insurance, and permits.
                    </p>
                  </div>

                  {/* Section VII */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">VII. PERSONNEL</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      CONTRACTOR may engage employees or subcontractors ("Personnel"), provided they meet all Courial requirements, including background checks. CONTRACTOR is solely responsible for payment and compliance for all Personnel.
                    </p>
                  </div>

                  {/* Section VIII */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">VIII. INSURANCE & INDEMNITY</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• CONTRACTOR must maintain all legally required insurance, including auto insurance.</li>
                      <li>• CONTRACTOR acknowledges COURIAL does not provide workers' compensation coverage.</li>
                      <li>• CONTRACTOR agrees to indemnify and hold harmless COURIAL from claims, losses, and liabilities arising from CONTRACTOR's actions or omissions.</li>
                    </ul>
                  </div>

                  {/* Section IX */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">IX. MUTUAL ARBITRATION PROVISION</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Any dispute arising out of or relating to this Agreement shall be resolved through binding arbitration administered under CPR Rules, governed by the Federal Arbitration Act (FAA). Arbitration shall be conducted on an individual basis only—class actions and collective arbitration are waived. CONTRACTOR may opt out of this arbitration provision within 30 days of accepting this Agreement by providing written notice to COURIAL.
                    </p>
                  </div>

                  {/* Section X */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">X. TERMINATION</h3>
                    <ul className="text-muted-foreground leading-relaxed space-y-2">
                      <li>• CONTRACTOR may terminate this Agreement with 7 days' written notice.</li>
                      <li>• COURIAL may terminate or deactivate CONTRACTOR's account for material breach, policy violations, poor performance, fraud, or as otherwise set forth in the Deactivation Policy.</li>
                    </ul>
                  </div>

                  {/* Section XI */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">XI. ENTIRE AGREEMENT & GOVERNING LAW</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      This Agreement supersedes prior agreements and may only be amended in writing. Governing law will be the jurisdiction where CONTRACTOR performs services, except arbitration, which is governed by the FAA.
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

export default ICA;
