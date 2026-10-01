'use client';
import { motion } from 'framer-motion';
import { Cpu, BrainCircuit, Bot, Code2 } from 'lucide-react';

const services = [
  {
    icon: <Cpu size={28} />,
    title: 'AI & Autonomous Agents',
    desc: 'I design and build intelligent agents that can analyze data, make decisions, and automate workflows.',
  },
  {
    icon: <BrainCircuit size={28} />,
    title: 'Software Engineering',
    desc: 'I build the screens, APIs, and backend that turn your idea into a working app.',
  },
  {
    icon: <Bot size={28} />,
    title: 'Agentic Workflows',
    desc: 'I connect your tools and automate the repetitive bits of your workflow.',
  },
  {
    icon: <Code2 size={28} />,
    title: 'MLOps & Deployment',
    desc: 'I help get models and apps running in the cloud, with updates that are easier to manage.',
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-10 px-6 md:px-20">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="max-w-7xl mx-auto text-white"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-neon drop-shadow-[0_0_0.3rem_#00ffe0]">
          How I can help
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {services.map((service, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-xl hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="text-neon mb-4">{service.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-gray-300">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
