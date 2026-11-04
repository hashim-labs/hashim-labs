import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
export default function ToolFrame({slug,name,eyebrow,title,accentTitle,description,icon:Icon,theme,children,stored}){
  return <main className={`lab-shell ${theme}`}><nav className="lab-nav"><Link href={`/projects/${slug}`}><ArrowLeft size={15}/>Case study</Link><span>HASHIM / BUILD LAB</span><Link href="/#projects">All projects<ArrowUpRight size={13}/></Link><ThemeToggle /></nav><header className="lab-header"><div className="lab-icon"><Icon size={23}/></div><p className="lab-eyebrow">{eyebrow}</p><h1>{title}<br/><span>{accentTitle}</span></h1><p>{description}</p><div className="lab-badges"><span>{stored?'Saved in this browser':'Local-first workspace'}</span><span>No account needed</span><span>Export your work</span></div></header>{children}<footer className="lab-bottom">{name} · Built by Hashim · Your workspace is processed locally in this browser.</footer></main>;
}
