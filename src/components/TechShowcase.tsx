import { motion } from "framer-motion";
import { Brain, Route, Clock, TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const efficiencyData = [
  { month: "Jan", efficiency: 72 },
  { month: "Feb", efficiency: 78 },
  { month: "Mar", efficiency: 82 },
  { month: "Apr", efficiency: 85 },
  { month: "May", efficiency: 91 },
  { month: "Jun", efficiency: 94 },
  { month: "Jul", efficiency: 97 },
];

const deliveryMetrics = [
  { name: "On-Time", value: 98.7 },
  { name: "Accuracy", value: 99.2 },
  { name: "Satisfaction", value: 96.5 },
  { name: "Efficiency", value: 94.8 },
];

const features = [
  {
    icon: Brain,
    title: "AI Route Optimization",
    description: "Machine learning algorithms that reduce delivery times by 40%",
  },
  {
    icon: Route,
    title: "Smart Dispatching",
    description: "Real-time matching of Courials to orders for maximum efficiency",
  },
  {
    icon: Clock,
    title: "Predictive ETAs",
    description: "Accurate arrival predictions powered by historical data analysis",
  },
  {
    icon: Shield,
    title: "Vetted Courials",
    description: "Rigorous screening ensures only the best join our network",
  },
];

const stats = [
  { value: "2M+", label: "Deliveries Completed" },
  { value: "93.6%", label: "Accuracy Rate" },
  { value: "40%", label: "Faster Than Average" },
];

export const TechShowcase = () => {
  return (
    <section className="pb-24 md:pb-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-black-orange">
            The technology behind<br />industry-leading service
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bridging the gap between intelligent AI and the human touch. 
            We're not just moving goods; we're redefining the logistics standard.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl glass-card transition-all duration-300 hover:border-primary/50"
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-2xl glass-card transition-all duration-300 hover:border-primary/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delivery Efficiency</h3>
                <p className="text-sm text-muted-foreground">AI optimization over time</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyData}>
                  <defs>
                    <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(30, 100%, 70%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(30, 100%, 70%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    domain={[60, 100]}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="hsl(30, 100%, 70%)"
                    strokeWidth={2}
                    fill="url(#efficiencyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-8 rounded-2xl glass-card transition-all duration-300 hover:border-primary/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Performance Metrics</h3>
                <p className="text-sm text-muted-foreground">Real-time service quality</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryMetrics} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(25, 100%, 60%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(30, 100%, 70%)" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="barGrey" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--foreground) / 0.35)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--foreground) / 0.15)" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    domain={[80, 100]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {deliveryMetrics.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? 'url(#barOrange)' : 'url(#barGrey)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="p-6 rounded-2xl glass-card transition-all duration-300 hover:border-primary/50 group"
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                  <Icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-muted-foreground mt-12 max-w-xl mx-auto"
        >
          Our technology learns and improves with every delivery, making us 
          one of the most reliable logistics platforms in the business.
        </motion.p>
      </div>
    </section>
  );
};
