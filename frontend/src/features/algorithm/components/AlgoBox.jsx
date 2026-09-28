import { Info, Verified, ArrowUpRight, Lock, CheckCircle } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"

function AlgoBox({ algo }) {
    const navigate = useNavigate();

    const title = algo?.title || "Untitled Algorithm";
    const descriptionText = algo?.theory?.description || "No description available";
    const isUnlocked = algo?.unlocked ?? true;
    const isCompleted = algo?.isCompleted ?? false;

    const description = !isUnlocked 
        ? "🔒 Complete the previous algorithm to unlock this section"
        : descriptionText.length > 80
            ? descriptionText.slice(0, 80) + "..."
            : descriptionText;

    const handleClick = () => {
        // console.log("slug: ", algo?.slug)
        if (!isUnlocked) return; 
        if (!algo?.slug) return;
        navigate(`/algo/${algo.slug}`);
    }

    return (
        <motion.section
            whileHover={{ 
                y: isUnlocked ? -6 : 0, 
                scale: isUnlocked ? 1.02 : 1 
            }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`
                relative w-full max-w-sm h-44
                rounded-2xl p-4
                bg-white/5 backdrop-blur-lg
                border shadow-lg
                overflow-hidden
                ${isUnlocked 
                    ? 'border-white/10 cursor-pointer group hover:border-emerald-500/50' 
                    : 'border-white/5 cursor-not-allowed opacity-70'
                }
            `}
            onClick={handleClick}
        >
            <div className={`
                absolute inset-0 opacity-0 transition duration-300
                ${isUnlocked ? 'group-hover:opacity-100' : ''}
                bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10
            `} />

            {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-2">
                        <Lock size={32} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Locked</span>
                    </div>
                </div>
            )}

            <div className='flex justify-between items-start relative z-10'>
                <h2 className='text-white font-semibold text-lg leading-tight flex items-center gap-2'>
                    <span className={!isUnlocked ? 'text-gray-500' : 'text-white'}>
                        {title}
                    </span>
                </h2>

                <div className="flex gap-2">
                    {isCompleted && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                            <CheckCircle size={12} />
                            Completed
                        </div>
                    )}
                    {/* <div className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs
                        ${algo?.verified
                            ? "bg-green-500/20 text-green-400 border border-green-400/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-400/30"}
                    `}>
                        {algo?.verified ? (
                            <>
                                <Verified size={12} />
                                Verified
                            </>
                        ) : (
                            <>
                                <Info size={12} />
                                Draft
                            </>
                        )}
                    </div> */}
                </div>
            </div>

            <p className={`
                text-sm mt-2 leading-relaxed relative z-10 line-clamp-3
                ${!isUnlocked ? 'text-gray-600' : 'text-gray-400'}
            `}>
                {description}
            </p>

            {isUnlocked && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition z-10">
                    <ArrowUpRight className="text-gray-400 group-hover:text-white" size={18} />
                </div>
            )}
        </motion.section>
    )
}

export default AlgoBox