"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RevealDirection = "start" | "end" | "center";
type AnimateOn = "hover" | "view" | "click" | "inViewHover";
type ClickMode = "once" | "toggle";

interface DecodeTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: RevealDirection;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: AnimateOn;
  clickMode?: ClickMode;
}

export function DecodeText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
}: DecodeTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isRevealed, setIsRevealed] = useState(animateOn !== "click");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const sequenceRef = useRef<number[]>([]);
  const sequenceStepRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const characterPool = useMemo(
    () =>
      useOriginalCharsOnly
        ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
        : characters.split(""),
    [useOriginalCharsOnly, text, characters],
  );

  const scramble = useCallback(
    (source: string, revealed: Set<number>) =>
      source
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }
          if (revealed.has(index)) {
            return source[index];
          }
          return characterPool[
            Math.floor(Math.random() * characterPool.length)
          ];
        })
        .join(""),
    [characterPool],
  );

  const getRevealSequence = useCallback(
    (length: number) => {
      const sequence: number[] = [];

      if (length <= 0) {
        return sequence;
      }

      if (revealDirection === "start") {
        for (let index = 0; index < length; index += 1) {
          sequence.push(index);
        }
        return sequence;
      }

      if (revealDirection === "end") {
        for (let index = length - 1; index >= 0; index -= 1) {
          sequence.push(index);
        }
        return sequence;
      }

      const middle = Math.floor(length / 2);
      let offset = 0;

      while (sequence.length < length) {
        if (offset % 2 === 0) {
          const candidate = middle + offset / 2;
          if (candidate >= 0 && candidate < length) {
            sequence.push(candidate);
          }
        } else {
          const candidate = middle - Math.ceil(offset / 2);
          if (candidate >= 0 && candidate < length) {
            sequence.push(candidate);
          }
        }
        offset += 1;
      }

      return sequence.slice(0, length);
    },
    [revealDirection],
  );

  const getAllIndices = useCallback(() => {
    const indices = new Set<number>();
    for (let index = 0; index < text.length; index += 1) {
      indices.add(index);
    }
    return indices;
  }, [text]);

  const removeRandomIndices = useCallback(
    (source: Set<number>, count: number) => {
      const remaining = Array.from(source);

      for (let i = 0; i < count && remaining.length > 0; i += 1) {
        const removeAt = Math.floor(Math.random() * remaining.length);
        remaining.splice(removeAt, 1);
      }

      return new Set(remaining);
    },
    [],
  );

  const getNextSequentialIndex = useCallback(
    (revealed: Set<number>) => {
      const length = text.length;

      switch (revealDirection) {
        case "end":
          return length - 1 - revealed.size;
        case "center": {
          const middle = Math.floor(length / 2);
          const half = Math.floor(revealed.size / 2);
          const candidate =
            revealed.size % 2 === 0 ? middle + half : middle - half - 1;

          if (candidate >= 0 && candidate < length && !revealed.has(candidate)) {
            return candidate;
          }

          for (let index = 0; index < length; index += 1) {
            if (!revealed.has(index)) {
              return index;
            }
          }

          return 0;
        }
        case "start":
        default:
          return revealed.size;
      }
    },
    [revealDirection, text.length],
  );

  const startForward = useCallback(() => {
    if (sequential) {
      sequenceRef.current = getRevealSequence(text.length);
      sequenceStepRef.current = 0;
    }
    setRevealedIndices(new Set());
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, getRevealSequence, text.length]);

  const startReverse = useCallback(() => {
    if (sequential) {
      sequenceRef.current = getRevealSequence(text.length).slice().reverse();
      sequenceStepRef.current = 0;
    }
    setRevealedIndices(getAllIndices());
    setDisplayText(scramble(text, getAllIndices()));
    setDirection("reverse");
    setIsAnimating(true);
  }, [sequential, getRevealSequence, text, getAllIndices, scramble]);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    let nonSequentialStep = 0;

    intervalRef.current = setInterval(() => {
      setRevealedIndices((previous) => {
        if (sequential) {
          if (direction === "forward") {
            if (previous.size >= text.length) {
              if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
              }
              setIsAnimating(false);
              setIsRevealed(true);
              return previous;
            }

            const nextIndex = getNextSequentialIndex(previous);
            const next = new Set(previous);
            next.add(nextIndex);
            setDisplayText(scramble(text, next));
            return next;
          }

          if (sequenceStepRef.current < sequenceRef.current.length) {
            const removeIndex =
              sequenceRef.current[sequenceStepRef.current] ?? 0;
            sequenceStepRef.current += 1;
            const next = new Set(previous);
            next.delete(removeIndex);
            setDisplayText(scramble(text, next));

            if (next.size === 0) {
              if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
              }
              setIsAnimating(false);
              setIsRevealed(false);
            }

            return next;
          }

          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
          }
          setIsAnimating(false);
          setIsRevealed(false);
          return previous;
        }

        if (direction === "forward") {
          setDisplayText(scramble(text, previous));
          nonSequentialStep += 1;

          if (nonSequentialStep >= maxIterations) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
            }
            setIsAnimating(false);
            setDisplayText(text);
            setIsRevealed(true);
          }

          return previous;
        }

        let current = previous;
        if (current.size === 0) {
          current = getAllIndices();
        }

        const next = removeRandomIndices(
          current,
          Math.max(1, Math.ceil(text.length / Math.max(1, maxIterations))),
        );
        setDisplayText(scramble(text, next));
        nonSequentialStep += 1;

        if (next.size === 0 || nonSequentialStep >= maxIterations) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
          }
          setIsAnimating(false);
          setIsRevealed(false);
          setDisplayText(scramble(text, new Set()));
          return new Set<number>();
        }

        return next;
      });
    }, speed);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    direction,
    scramble,
    getAllIndices,
    getNextSequentialIndex,
    removeRandomIndices,
  ]);

  const handleMouseEnter = useCallback(() => {
    if (isAnimating) {
      return;
    }
    setRevealedIndices(new Set());
    setIsRevealed(false);
    setDisplayText(text);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text]);

  const handleMouseLeave = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsRevealed(true);
    setDirection("forward");
  }, [text]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startForward();
            setHasAnimated(true);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 },
    );

    const wrapper = wrapperRef.current;

    if (wrapper) {
      observer.observe(wrapper);
    }

    return () => {
      if (wrapper) {
        observer.unobserve(wrapper);
      }
    };
  }, [animateOn, hasAnimated, startForward]);

  const hoverHandlers =
    animateOn === "hover" || animateOn === "inViewHover"
      ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
      : {};
  const clickHandlers =
    animateOn === "click"
      ? {
          onClick: () => {
            if (clickMode === "once") {
              if (isRevealed) {
                return;
              }
              setDirection("forward");
              startForward();
              return;
            }

            if (clickMode === "toggle") {
              if (isRevealed) {
                startReverse();
              } else {
                setDirection("forward");
                startForward();
              }
            }
          },
        }
      : {};

  return (
    <span
      className={`${parentClassName}wrapper`}
      ref={wrapperRef}
      {...hoverHandlers}
      {...clickHandlers}
    >
      <span className="sr-only">{displayText}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const revealed =
            revealedIndices.has(index) || (!isAnimating && isRevealed);

          return (
            <span
              key={index}
              className={revealed ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
