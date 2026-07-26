/**
 * Wikibooks content generator.
 * Uses a curated list of engineering-relevant Wikibooks.
 *
 * Output: [{ title, description, url }]
 * No subject, branch, semester, contributor, tags.
 *
 * Usage: node scripts/fetch-wikibooks.mjs
 */

const BOOKS = [
  { title: "C Programming", desc: "A comprehensive guide to programming in C, covering basics to advanced topics." },
  { title: "C++ Programming", desc: "Complete guide to C++ programming including OOP, STL, and modern C++ features." },
  { title: "Java Programming", desc: "Learn Java from fundamentals to advanced topics including Swing and networking." },
  { title: "Python Programming", desc: "A comprehensive introduction to Python programming language and its applications." },
  { title: "JavaScript", desc: "Client-side and server-side JavaScript programming guide." },
  { title: "Data Structures", desc: "Implementation and analysis of fundamental data structures and algorithms." },
  { title: "Algorithm Implementation", desc: "Practical implementation of common algorithms in multiple programming languages." },
  { title: "Linear Algebra", desc: "Vectors, matrices, linear transformations, and applications in engineering." },
  { title: "Calculus", desc: "Differential and integral calculus with engineering applications." },
  { title: "Discrete Mathematics", desc: "Logic, set theory, combinatorics, graph theory for computer science." },
  { title: "Statistics", desc: "Probability theory, statistical inference, and data analysis methods." },
  { title: "Ordinary Differential Equations", desc: "Solution methods for ODEs with engineering applications." },
  { title: "Partial Differential Equations", desc: "PDE solution techniques for engineering and physics problems." },
  { title: "Numerical Methods", desc: "Computational methods for solving mathematical problems in engineering." },
  { title: "Digital Electronics", desc: "Digital logic design, Boolean algebra, combinational and sequential circuits." },
  { title: "Microprocessor Design", desc: "Architecture and design of microprocessors and embedded systems." },
  { title: "Embedded Systems", desc: "Design and programming of embedded systems and microcontrollers." },
  { title: "Computer Networks", desc: "Network protocols, architectures, and technologies from physical to application layer." },
  { title: "Operating Systems", desc: "Process management, memory management, file systems, and OS design principles." },
  { title: "Database Design", desc: "Relational database design, SQL, normalization, and transaction management." },
  { title: "Compiler Design", desc: "Lexical analysis, parsing, code generation, and optimization techniques." },
  { title: "Software Engineering", desc: "Software development methodologies, requirements, design, and testing." },
  { title: "Artificial Intelligence", desc: "Search algorithms, knowledge representation, machine learning, and NLP." },
  { title: "Machine Learning", desc: "Supervised and unsupervised learning, neural networks, and deep learning." },
  { title: "Data Science", desc: "Data analysis, visualization, and statistical modeling with Python and R." },
  { title: "Cybersecurity", desc: "Network security, cryptography, ethical hacking, and security best practices." },
  { title: "Cloud Computing", desc: "Cloud architecture, virtualization, containerization, and major cloud platforms." },
  { title: "Internet of Things", desc: "IoT architecture, sensors, communication protocols, and embedded connectivity." },
  { title: "Digital Signal Processing", desc: "Signal analysis, Fourier transforms, filters, and DSP applications." },
  { title: "Image Processing", desc: "Digital image processing techniques including filtering, segmentation, and compression." },
  { title: "Computer Architecture", desc: "CPU design, memory hierarchy, pipelining, and parallel architectures." },
  { title: "Theory of Computation", desc: "Automata theory, formal languages, computability, and complexity theory." },
  { title: "Communication Systems", desc: "Analog and digital communication, modulation, coding, and information theory." },
  { title: "Control Systems", desc: "Feedback control, transfer functions, stability analysis, and PID controllers." },
  { title: "Power Electronics", desc: "Power semiconductor devices, converters, inverters, and motor drives." },
  { title: "Engineering Thermodynamics", desc: "Laws of thermodynamics, heat engines, refrigeration, and energy systems." },
  { title: "Fluid Mechanics", desc: "Fluid properties, statics, dynamics, flow measurement, and applications." },
  { title: "Engineering Mechanics", desc: "Statics and dynamics, force analysis, equilibrium, and motion." },
  { title: "Strength of Materials", desc: "Stress, strain, bending, torsion, and failure analysis of materials." },
  { title: "Engineering Physics", desc: "Quantum mechanics, optics, electromagnetism, and modern physics for engineers." },
  { title: "Engineering Chemistry", desc: "Chemical thermodynamics, electrochemistry, polymers, and material science." },
  { title: "Engineering Biology", desc: "Biotechnology, genetics, bioinformatics, and biological systems for engineers." },
  { title: "Environmental Engineering", desc: "Water treatment, air pollution control, waste management, and sustainability." },
  { title: "Structural Engineering", desc: "Structural analysis, design of beams, columns, and frameworks." },
  { title: "Transportation Engineering", desc: "Highway, railway, airport design, traffic engineering, and planning." },
  { title: "Geotechnical Engineering", desc: "Soil mechanics, foundation design, slope stability, and earth structures." },
  { title: "Hydrology", desc: "Water cycle, precipitation, runoff, groundwater, and hydrological modeling." },
  { title: "Engineering Economics", desc: "Cost analysis, project evaluation, depreciation, and financial decision making." },
  { title: "Engineering Ethics", desc: "Professional ethics, social responsibility, and ethical decision making in engineering." },
  { title: "Technical Writing", desc: "Writing technical reports, documentation, proposals, and research papers." },
  { title: "LaTeX", desc: "Document preparation system for technical and scientific writing." },
  { title: "MATLAB Programming", desc: "Scientific computing, data analysis, and visualization with MATLAB." },
  { title: "R Programming", desc: "Statistical computing, data analysis, and visualization with R." },
  { title: "HTML5", desc: "Modern web development with HTML5, semantic markup, and multimedia." },
  { title: "CSS", desc: "Cascading Style Sheets for web design, layouts, and responsive design." },
  { title: "SQL", desc: "Structured Query Language for database management and data manipulation." },
  { title: "VHDL", desc: "Hardware description language for digital circuit design and FPGA programming." },
  { title: "Parallel Computing", desc: "Parallel architectures, programming models, MPI, OpenMP, and GPU computing." },
  { title: "Blockchain", desc: "Blockchain technology, cryptocurrencies, smart contracts, and distributed ledgers." },
  { title: "Quantum Computing", desc: "Quantum bits, quantum gates, quantum algorithms, and quantum information." },
  { title: "Robotics", desc: "Robot kinematics, sensors, actuators, control, and programming." },
  { title: "Computer Graphics", desc: "Rendering, shading, ray tracing, and graphics programming with OpenGL." },
  { title: "Game Design", desc: "Game development principles, game engines, and interactive design." },
  { title: "Assembly Language", desc: "Low-level programming, CPU architecture, and system programming." },
  { title: "Web Development", desc: "Full-stack web development, frameworks, APIs, and deployment." },
  { title: "Mobile App Development", desc: "iOS and Android app development, cross-platform frameworks, and UI design." },
];

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outputDir = new URL("..", import.meta.url).pathname;
const outDir = join(outputDir, "wikibooks");
mkdirSync(outDir, { recursive: true });

const docs = BOOKS.map((b) => ({
  title: b.title,
  description: b.desc,
  url: `https://en.wikibooks.org/wiki/${encodeURIComponent(b.title.replace(/ /g, "_"))}`,
}));

const filepath = join(outDir, "engineering-computer-science.json");
writeFileSync(filepath, JSON.stringify(docs, null, 2));
console.log(`Wrote ${docs.length} documents to ${filepath}`);
