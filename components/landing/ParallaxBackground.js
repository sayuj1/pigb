import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ParallaxBackground = () => {
    const { scrollYProgress } = useScroll();

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -800]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                style={{ y: y1 }}
                className="absolute top-20 left-10 w-24 h-24 bg-[#00b894]/10 rounded-full blur-2xl"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute top-1/4 right-20 w-48 h-48 bg-[#00cec9]/10 rounded-full blur-3xl"
            />
            <motion.div
                style={{ y: y3 }}
                className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"
            />
            <motion.div
                style={{ y: y1 }}
                className="absolute top-1/2 right-1/4 w-40 h-40 bg-teal-300/10 rounded-full blur-3xl"
            />
        </div>
    );
};

export default ParallaxBackground;
