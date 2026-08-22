import { LibraryBrowser } from "@/components/library/LibraryBrowser";
import { CATS, GAMES } from "@/lib/games";

export default function LibraryPage() {
  return <LibraryBrowser games={GAMES} cats={CATS} />;
}
