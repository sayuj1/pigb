import { motion } from "framer-motion";

export default function Loader({ text = "Loading your expenses..." }) {


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            {/* Bars animation */}
            <div className="flex space-x-2">
                {[0.4, 0.6, 0.8, 0.5].map((scale, i) => (
                    <motion.div
                        key={i}
                        className="w-3 rounded bg-indigo-600"
                        initial={{ scaleY: 0.2 }}
                        animate={{ scaleY: [0.2, scale, 0.2] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: i * 0.2,
                            ease: "easeInOut",
                        }}
                        style={{ height: "60px" }}
                    />
                ))}
            </div>

            {/* Animated fancy text */}
            <div className="flex space-x-1 text-indigo-600 font-semibold text-xl">
                {text.split("").map((char, i) => (
                    <motion.span
                        key={i}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                ))}
            </div>


        </div>
    );
}
