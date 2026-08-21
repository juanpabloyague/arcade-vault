import { notFound } from "next/navigation";
import { PlayerScreen } from "@/components/player/PlayerScreen";
import { getGame } from "@/lib/games";

export default async function PlayGamePage({ params }: PageProps<"/jugar/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return <PlayerScreen game={game} />;
}
