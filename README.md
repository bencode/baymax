# Pólya

A self-growing, everyday agent assistant for researchers and educators. Runs locally, built on [pi](https://github.com/earendil-works/pi).

Pólya ships composable primitives and a few rough seed skills. You grow the rest: corrections refine your skills, and what you read and discuss becomes linked notes in your own knowledge base.

> Status: early design. Not usable yet.

## Your data stays yours

Pólya runs on your own computer. Your files, notes, conversations and knowledge base never leave it, except for the parts of a conversation sent to the language model you use. If Pólya offers a hosted model service, that service forwards requests without storing them and records only token usage.

## Origin

Pólya started as something I wanted to build for a friend, Anna, a university teacher working on electromagnetic fields and waves and 5G/6G communications: an assistant for her daily teaching and research. I soon realized I couldn't design her tools for her: only she knows how she works. So Pólya provides the building blocks, and she shapes the rest.

## Why "Pólya"

George Pólya (1887–1985) was a mathematician who spent much of his life on a teacher's question: how do people learn to solve problems? His answer, *How to Solve It* (1945), gives four steps:

```text
1. Understand the problem   → you say what needs doing
2. Devise a plan            → the agent composes primitives and skills
3. Carry out the plan       → the work gets done
4. Look back                → you correct; the skill improves
```

Pólya insisted that step 4 is where learning happens, and that it is the step most people skip. Pólya the platform turns looking back into a mechanism: a correction is not thrown away, it becomes an improvement to a skill you own.

Two more echoes:

- **Heuristics.** Pólya's word for rules of thumb that guide, not dictate. A skill here is exactly that: "for this kind of task, usually do it this way," revised with experience.
- **Pólya's urn.** Draw a ball, return it with another of the same color, and the urn drifts toward what has been drawn. A process that reinforces itself with use, like skills shaped by one person's daily work.

Pronunciation: *POH-ya* (Hungarian *ly* sounds like *y*). Written `polya` in commands and package names.
