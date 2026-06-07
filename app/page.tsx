import PollsDashboard from "./polls-dashboard";
import { getWorkspace } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialData = await getWorkspace();
  return <PollsDashboard initialData={initialData} />;
}
