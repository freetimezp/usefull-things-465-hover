document.fonts.ready.then(() => {
    // Register the GSAP text animation plugin.
    gsap.registerPlugin(SplitText);

    // Check whether the visitor prefers reduced motion.
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    // Select the elements we want to animate.
    const visual = document.querySelector("#visual");
    const frontPortrait = document.querySelector(".portrait--front");
    const glassPanel = document.querySelector(".glass-panel");
    const lightBeam = document.querySelector(".light-beam");
    const exploreButton = document.querySelector("#explore");

    // Keep track of the current reveal position.
    let revealPosition = 50;

    // Prepare the headline for a staggered entrance animation.
    const titleSplit = SplitText.create(".title-word", {
        type: "chars",
        charsClass: "title-char",
    });

    // Start the characters below their visible position.
    gsap.set(titleSplit.chars, {
        yPercent: 110,
        opacity: 0,
    });

    // Set the initial position of the introductory elements.
    gsap.set([".eyebrow", ".description", ".explore", ".header", ".footer"], {
        opacity: 0,
        y: 20,
    });

    // Create the opening timeline.
    const introTimeline = gsap.timeline({
        defaults: {
            ease: "power3.out",
        },
    });

    // Reveal the page in a coordinated sequence.
    introTimeline
        .to(".header", {
            opacity: 1,
            y: 0,
            duration: 0.8,
        })
        .to(
            titleSplit.chars,
            {
                yPercent: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.025,
            },
            "-=0.35",
        )
        .to(
            [".eyebrow", ".description", ".explore"],
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.12,
            },
            "-=0.55",
        )
        .from(
            ".portrait",
            {
                opacity: 0,
                scale: 0.92,
                duration: 1.2,
                stagger: 0.15,
            },
            "-=1",
        )
        .from(
            ".glass-panel",
            {
                scaleY: 0,
                transformOrigin: "top",
                duration: 1,
            },
            "-=0.8",
        )
        .to(
            ".footer",
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
            },
            "-=0.5",
        );

    // Update the image reveal and glass position.
    function updateReveal(position) {
        // Keep the reveal within the edges of the image.
        revealPosition = gsap.utils.clamp(5, 95, position);

        // Reveal the color image on the right side of the glass.
        gsap.to(frontPortrait, {
            clipPath: `inset(0 0 0 ${revealPosition}%)`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
        });

        // Move the glowing glass line to match the reveal.
        gsap.to([glassPanel, lightBeam], {
            left: `${revealPosition}%`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
        });
    }

    const portrait3D = document.querySelector("#portrait-3d");

    // Move the glass and colored image in 3D as the pointer moves.
    visual.addEventListener("pointermove", (event) => {
        if (reduceMotion) return;

        const bounds = visual.getBoundingClientRect();

        // Convert pointer coordinates into values between -1 and 1.
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

        // Move the dividing line to follow the pointer horizontally.
        updateReveal((x + 1) * 50);

        // Rotate the colored portrait and glass as one 3D plane.
        gsap.to(portrait3D, {
            rotationY: x * 14,
            rotationX: -y * 8,
            x: x * 10,
            y: y * 6,
            duration: 0.65,
            ease: "power3.out",
            transformPerspective: 1100,
            transformOrigin: "center center",
            overwrite: true,
        });

        // Create a little additional depth in the front image.
        gsap.to(".portrait--front img", {
            scale: 1.04,
            duration: 0.65,
            ease: "power2.out",
            overwrite: true,
        });
    });

    // Return everything to its neutral position.
    visual.addEventListener("pointerleave", () => {
        updateReveal(50);

        gsap.to(portrait3D, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            overwrite: true,
        });

        gsap.to(".portrait--front img", {
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            overwrite: true,
        });
    });

    // Make the main CTA move the reveal across the image.
    exploreButton.addEventListener("click", () => {
        const destination = revealPosition > 70 ? 15 : 85;

        gsap.to(
            { position: revealPosition },
            {
                position: destination,
                duration: 1.2,
                ease: "power3.inOut",
                onUpdate() {
                    // Read the animated position and update the image.
                    const progress = this.targets()[0].position;
                    updateReveal(progress);
                },
            },
        );

        // Add a small tactile response to the button.
        gsap.fromTo(
            ".explore-icon",
            {
                scale: 0.85,
                rotate: -25,
            },
            {
                scale: 1,
                rotate: 0,
                duration: 0.6,
                ease: "back.out(2)",
            },
        );
    });

    // For reduced-motion users, skip the opening animation.
    if (reduceMotion) {
        introTimeline.progress(1);
        updateReveal(50);
    }
});
