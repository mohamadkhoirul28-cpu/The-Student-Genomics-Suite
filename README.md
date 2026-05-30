# The Student Genomics Suite

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=googlecloud)](https://the-student-genomics-suite-251962108755.asia-southeast1.run.app)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🧬 About

**Educational bioinformatics workflow assistant for Indonesian biology students.**

The Student Genomics Suite is a web-based educational platform designed to simplify Sanger sequencing analysis for undergraduate biology students. It addresses the common pain point of using multiple disconnected tools (BioEdit, BLAST, DnaSP, MEGA, Excel) by providing an integrated workflow from sequence upload to AI-generated report.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **File Upload** | Multi-format support (FASTA, AB1, SEQ) with auto-validation |
| 🔬 **Sequence Analysis** | Multiple Sequence Alignment (MSA) with color-coded visualization |
| 📊 **Diversity Metrics** | Haplotype diversity (Hd) and nucleotide diversity (π) calculations |
| 🌳 **Phylogenetic Trees** | Interactive Neighbor-Joining trees with bootstrap support |
| 🧬 **NCBI BLAST** | Real BLAST integration for species identification |
| 📥 **Reference Fetcher** | Fetch reference sequences from NCBI GenBank by accession |
| 🤖 **AI Insights** | Google Gemini-powered biological interpretation of results |
| 🎨 **Modern UI** | Light/dark mode, responsive design, intuitive workflow |

## 🚀 Live Demo

Access the live application: [https://the-student-genomics-suite-251962108755.asia-southeast1.run.app](https://the-student-genomics-suite-251962108755.asia-southeast1.run.app)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Charts | Recharts, D3.js |
| Backend (NCBI Proxy) | FastAPI, Python, Cloud Run |
| AI | Google Gemini API |
| Deployment | Google Cloud Run |

## 📁 Project Structure
src/
├── components/ # React components
│ ├── analysis/ # MSA, Diversity, Phylogeny
│ ├── auth/ # Google Sign-In, AuthModal
│ ├── dashboard/ # Dashboard view
│ ├── landing/ # Landing page
│ ├── layout/ # Sidebar, Header
│ ├── ncbi/ # BLAST, Reference Fetcher
│ ├── profile/ # Profile settings
│ ├── reports/ # AI insight generator
│ ├── sequences/ # Sequence table, detail view
│ └── upload/ # File upload component
├── context/ # AuthContext
├── stores/ # Zustand stores
├── types/ # TypeScript interfaces
└── utils/ # Helper functions

text

## 🎯 Target Users

- Indonesian biology students working with Sanger sequencing data
- Researchers needing simplified bioinformatics workflow
- Educational institutions teaching molecular biology

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

*Replaces 8+ fragmented tools (BioEdit, BLAST, DnaSP, MEGA, Excel) with one unified platform.*
