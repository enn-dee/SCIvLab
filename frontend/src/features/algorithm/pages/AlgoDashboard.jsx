import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"

import { Input } from '../../../components/ui/input'
import { Button } from "../../../components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

import {
    Filter,
    Search,
    Sparkles,
    Trophy,
    Flame,
    ChevronRight,
    BrainCircuit,
    Rocket,
    Star
} from 'lucide-react'

import AlgoBox from '../components/AlgoBox'

import { apiFetch } from '@/api/client.js'

function AlgoDashboard() {

    const [Category, setCategory] =
        useState("All");

    const [search, setSearch] =
        useState("");

    const [
        debouncedSearch,
        setDebouncedSearch
    ] = useState("");

    const [algos, setAlgos] =
        useState([]);

    const [
        completedAlgos,
        setCompletedAlgos
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    useEffect(() => {

        const fetchData =
            async () => {

                try {

                    const algosRes =
                        await apiFetch(
                            "algorithms"
                        );

                    const algosData =
                        await algosRes.json();

                    const progressRes =
                        await apiFetch(
                            "progress/user-progress"
                        );

                    const progressData =
                        await progressRes.json();

                    const progressArray =
                        Array.isArray(progressData)
                            ? progressData
                            : [];

                    const completed =
                        progressArray
                            .filter(
                                (p) => p.completed
                            )
                            .map(
                                (p) => p.algorithmSlug
                            );

                    setCompletedAlgos(
                        completed
                    );

                    const sortedAlgos =
                        Array.isArray(algosData)
                            ? [...algosData]
                            : [];

                    sortedAlgos.sort(
                        (a, b) =>
                            (a.order || 999) -
                            (b.order || 999)
                    );

                    const algosWithUnlockStatus =
                        sortedAlgos.map(
                            (
                                algo,
                                index,
                                sortedArray
                            ) => {

                                let unlocked =
                                    false;

                                if (index === 0) {

                                    unlocked = true;

                                } else {

                                    const prevAlgo =
                                        sortedArray[index - 1];

                                    unlocked =
                                        completed.includes(
                                            prevAlgo.slug
                                        );
                                }

                                return {
                                    ...algo,
                                    unlocked,
                                    isCompleted:
                                        completed.includes(
                                            algo.slug
                                        )
                                };
                            }
                        );

                    setAlgos(
                        algosWithUnlockStatus
                    );

                } catch (err) {

                    console.error(
                        "Fetch error:",
                        err
                    );

                    setError(
                        "Failed to load algorithms"
                    );

                } finally {

                    setLoading(false);

                }
            };

        fetchData();

    }, []);

    useEffect(() => {

        const timer =
            setTimeout(() => {

                setDebouncedSearch(
                    search
                );

            }, 300);

        return () =>
            clearTimeout(timer);

    }, [search]);

    const categories = [
        "All",
        ...new Set(
            algos
                .map(
                    (algo) =>
                        algo.category
                )
                .filter(Boolean)
        )
    ];

    const filteredAlgos =
        algos.filter((algo) => {

            const matchCategory =
                Category === "All" ||
                algo.category === Category;

            const matchSearch =
                (
                    algo.title || ""
                )
                    .toLowerCase()
                    .includes(
                        debouncedSearch.toLowerCase()
                    ) ||

                (
                    algo.theory?.description || ""
                )
                    .toLowerCase()
                    .includes(
                        debouncedSearch.toLowerCase()
                    );

            return (
                matchCategory &&
                matchSearch
            );
        });

    const completedCount =
        algos.filter(
            (a) => a.isCompleted
        ).length;

    const totalCount =
        algos.length;

    const progressPercentage =
        totalCount > 0
            ? (
                completedCount /
                totalCount
            ) * 100
            : 0;

    const nextToUnlock =
        algos.find(
            (algo) =>
                !algo.unlocked &&
                !algo.isCompleted
        );

    if (error) {

        return (

            <div
                className="
                    text-red-400
                    text-center
                    mt-20
                    text-lg
                    font-medium
                "
            >
                {error}
            </div>

        );
    }

    if (loading) {

        return (

            <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-24
                    gap-5
                "
            >

                <motion.div
                    animate={{
                        rotate: 360
                    }}

                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}

                    className="
                        w-16
                        h-16
                        rounded-full
                        border-[3px]
                        border-emerald-500/20
                        border-t-emerald-400
                    "
                />

                <p
                    className="
                        text-gray-400
                        text-lg
                        tracking-wide
                    "
                >
                    Loading algorithms...
                </p>

            </div>

        );
    }

    return (

        <section
            className="
                relative
                flex
                flex-col
                gap-8
                px-4
                md:px-8
                py-8
                overflow-hidden
            "
        >

            <div
                className="
                    absolute
                    top-0
                    left-0
                    w-[500px]
                    h-[500px]
                    bg-emerald-500/10
                    blur-[140px]
                    rounded-full
                    pointer-events-none
                "
            />

            <div
                className="
                    absolute
                    bottom-0
                    right-0
                    w-[400px]
                    h-[400px]
                    bg-cyan-500/10
                    blur-[140px]
                    rounded-full
                    pointer-events-none
                "
            />

            <div
                className="
                    relative
                    flex
                    flex-col
                    gap-5
                    max-w-4xl
                "
            >

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}

                    transition={{
                        duration: 0.6
                    }}

                    className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-full
                        bg-white/5
                        border
                        border-white/10
                        backdrop-blur-xl
                        w-fit
                    "
                >

                    <Sparkles
                        className="
                            text-yellow-400
                        "
                        size={16}
                    />

                    <span
                        className="
                            text-sm
                            text-gray-300
                            tracking-wide
                        "
                    >
                        Interactive Visual Learning Platform
                    </span>

                </motion.div>

                <motion.h1
                    className="
                        text-5xl
                        md:text-7xl
                        font-black
                        leading-[1.05]
                        tracking-tight
                    "

                    initial={{
                        opacity: 0,
                        y: 40,
                        filter: "blur(20px)"
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)"
                    }}

                    transition={{
                        duration: 0.7
                    }}
                >

                    <span
                        className="
                            bg-gradient-to-r
                            from-emerald-300
                            via-cyan-300
                            to-blue-500
                            bg-clip-text
                            text-transparent
                        "
                    >
                        Learn Algorithms
                    </span>

                    <br />

                    <span
                        className="
                            text-white
                        "
                    >
                        The Visual Way
                    </span>

                </motion.h1>

                <motion.p
                    className="
                        text-gray-400
                        text-lg
                        md:text-xl
                        leading-relaxed
                        max-w-3xl
                    "

                    initial={{
                        opacity: 0,
                        y: 20
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}

                    transition={{
                        duration: 0.6,
                        delay: 0.15
                    }}
                >

                    Explore beautifully animated
                    algorithm visualizations,
                    solve coding challenges,
                    and track your mastery journey
                    step by step.

                </motion.p>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}

                    transition={{
                        duration: 0.5,
                        delay: 0.25
                    }}

                    className="
                        flex
                        flex-wrap
                        gap-3
                        mt-2
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-2xl
                            bg-emerald-500/10
                            border
                            border-emerald-400/20
                            text-emerald-300
                            text-sm
                        "
                    >

                        <BrainCircuit size={16} />

                        Visual Learning

                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-2xl
                            bg-cyan-500/10
                            border
                            border-cyan-400/20
                            text-cyan-300
                            text-sm
                        "
                    >

                        <Rocket size={16} />

                        Interactive Coding

                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-2xl
                            bg-yellow-500/10
                            border
                            border-yellow-400/20
                            text-yellow-300
                            text-sm
                        "
                    >

                        <Flame size={16} />

                        Smart Progression

                    </div>

                </motion.div>

            </div>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 25
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                transition={{
                    duration: 0.6,
                    delay: 0.3
                }}

                className="
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-white/10
                    bg-gradient-to-br
                    from-white/[0.07]
                    to-white/[0.02]
                    backdrop-blur-2xl
                    p-6
                    shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                "
            >

                <div
                    className="
                        absolute
                        top-0
                        right-0
                        w-40
                        h-40
                        bg-emerald-500/10
                        blur-[80px]
                        rounded-full
                    "
                />

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        justify-between
                        gap-6
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            gap-4
                        "
                    >

                        <div
                            className="
                                p-4
                                rounded-2xl
                                bg-gradient-to-br
                                from-emerald-500
                                to-cyan-500
                                shadow-lg
                            "
                        >

                            <Trophy
                                className="
                                    text-white
                                "
                                size={28}
                            />

                        </div>

                        <div>

                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    text-white
                                "
                            >
                                Your Journey
                            </h3>

                            <p
                                className="
                                    text-gray-400
                                    mt-1
                                    max-w-xl
                                "
                            >

                                {completedCount === 0
                                    ? "Start your first algorithm and unlock the journey."
                                    : completedCount === totalCount
                                        ? "You completed every algorithm. Incredible work."
                                        : nextToUnlock
                                            ? `Complete "${nextToUnlock.title}" to unlock the next challenge.`
                                            : "Keep progressing and sharpen your problem-solving skills."
                                }

                            </p>

                        </div>

                    </div>

                    <div
                        className="
                            flex
                            flex-col
                            items-start
                            lg:items-end
                            justify-center
                        "
                    >

                        <div
                            className="
                                text-5xl
                                font-black
                                bg-gradient-to-r
                                from-emerald-300
                                to-cyan-300
                                bg-clip-text
                                text-transparent
                            "
                        >
                            {completedCount}/{totalCount}
                        </div>

                        <div
                            className="
                                text-sm
                                text-gray-500
                                mt-1
                            "
                        >
                            Algorithms Mastered
                        </div>

                    </div>

                </div>

                <div
                    className="
                        mt-6
                    "
                >

                    <div
                        className="
                            w-full
                            h-4
                            rounded-full
                            bg-black/30
                            overflow-hidden
                            border
                            border-white/5
                        "
                    >

                        <motion.div
                            className="
                                h-full
                                rounded-full
                                bg-gradient-to-r
                                from-emerald-400
                                via-green-400
                                to-cyan-400
                                shadow-[0_0_25px_rgba(16,185,129,0.6)]
                            "

                            initial={{
                                width: 0
                            }}

                            animate={{
                                width: `${progressPercentage}%`
                            }}

                            transition={{
                                duration: 1
                            }}
                        />

                    </div>

                </div>

            </motion.div>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                transition={{
                    duration: 0.5,
                    delay: 0.35
                }}

                className="
                    flex
                    flex-col
                    lg:flex-row
                    gap-4
                    items-center
                    justify-between
                    rounded-[1.8rem]
                    border
                    border-white/10
                    bg-white/[0.04]
                    backdrop-blur-2xl
                    p-5
                    shadow-xl
                "
            >

                <div
                    className="
                        relative
                        w-full
                        lg:max-w-lg
                    "
                >

                    <Search
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-500
                            w-5
                            h-5
                        "
                    />

                    <Input
                        type="search"

                        placeholder="Search algorithms..."

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                        className="
                            pl-12
                            h-12
                            rounded-2xl
                            border-white/10
                            bg-black/20
                            text-white
                            placeholder:text-gray-500
                            focus:ring-2
                            focus:ring-emerald-500
                            focus:border-emerald-400
                        "
                    />

                </div>

                <DropdownMenu>

                    <DropdownMenuTrigger asChild>

                        <Button
                            className="
                                h-12
                                px-5
                                gap-2
                                rounded-2xl
                                bg-gradient-to-r
                                from-emerald-500
                                to-cyan-500
                                hover:opacity-90
                                text-white
                                shadow-lg
                            "
                        >

                            <Filter size={16} />

                            {Category}

                            <ChevronRight size={16} />

                        </Button>

                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-zinc-950/95
                            backdrop-blur-2xl
                            text-white
                            p-2
                        "
                    >

                        <DropdownMenuGroup>

                            <DropdownMenuRadioGroup
                                value={Category}
                                onValueChange={
                                    setCategory
                                }
                            >

                                {categories.map((cat) => (

                                    <DropdownMenuRadioItem
                                        key={cat}

                                        value={cat}

                                        className="
                                            cursor-pointer
                                            rounded-xl
                                            py-2
                                            hover:bg-emerald-500/10
                                            focus:bg-emerald-500/10
                                        "
                                    >
                                        {cat}
                                    </DropdownMenuRadioItem>

                                ))}

                            </DropdownMenuRadioGroup>

                        </DropdownMenuGroup>

                    </DropdownMenuContent>

                </DropdownMenu>

            </motion.div>

            <div
                className="
                    flex
                    items-center
                    gap-3
                    mt-2
                "
            >

                <div
                    className="
                        p-2
                        rounded-xl
                        bg-emerald-500/10
                        border
                        border-emerald-400/20
                    "
                >

                    <Star
                        className="
                            text-emerald-300
                        "
                        size={18}
                    />

                </div>

                <div>

                    <h2
                        className="
                            text-2xl
                            font-bold
                            text-white
                        "
                    >
                        Browse Algorithms
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Interactive visual lessons sorted by progression
                    </p>

                </div>

            </div>

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-3
                    gap-7
                "
            >

                {filteredAlgos.length === 0 ? (

                    <div
                        className="
                            col-span-full
                            text-center
                            text-gray-400
                            py-16
                        "
                    >
                        No algorithms found
                    </div>

                ) : (

                    filteredAlgos
                        .sort(
                            (a, b) =>
                                (a.order || 999) -
                                (b.order || 999)
                        )
                        .map(
                            (
                                algo,
                                index
                            ) => (

                                <motion.div
                                    key={algo._id}

                                    initial={{
                                        opacity: 0,
                                        y: 30
                                    }}

                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}

                                    transition={{
                                        duration: 0.35,
                                        delay: index * 0.05
                                    }}

                                    whileHover={{
                                        y: algo.unlocked
                                            ? -8
                                            : 0,
                                        scale: algo.unlocked
                                            ? 1.02
                                            : 1
                                    }}
                                >

                                    <AlgoBox
                                        algo={algo}
                                    />

                                </motion.div>

                            )
                        )

                )}

            </div>

            {completedCount === totalCount &&
                totalCount > 0 && (

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95
                        }}

                        animate={{
                            opacity: 1,
                            scale: 1
                        }}

                        transition={{
                            duration: 0.5
                        }}

                        className="
                            relative
                            overflow-hidden
                            rounded-[2rem]
                            border
                            border-yellow-400/20
                            bg-gradient-to-r
                            from-yellow-500/10
                            via-emerald-500/10
                            to-cyan-500/10
                            p-8
                            text-center
                            shadow-[0_20px_80px_rgba(0,0,0,0.4)]
                        "
                    >

                        <div
                            className="
                                absolute
                                inset-0
                                bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]
                            "
                        />

                        <h3
                            className="
                                relative
                                text-4xl
                                font-black
                                text-white
                                mb-3
                            "
                        >
                            🎉 Mastered All Algorithms
                        </h3>

                        <p
                            className="
                                relative
                                text-gray-300
                                max-w-2xl
                                mx-auto
                            "
                        >

                            You completed every algorithm
                            in the learning path.
                            Your consistency and dedication
                            turned you into an algorithm wizard.

                        </p>

                    </motion.div>

                )}

        </section>

    );
}

export default AlgoDashboard;