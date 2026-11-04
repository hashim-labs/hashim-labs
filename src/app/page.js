import Home from './Home';
import { publicProjects } from '@/lib/project-store';
export const dynamic = 'force-dynamic';
export default async function Page() { return <Home projects={await publicProjects()} />; }
