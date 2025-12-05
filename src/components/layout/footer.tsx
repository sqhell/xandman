import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built for{" "}
          <Link
            href="https://xandeum.network"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Xandeum
          </Link>
          . pNode analytics powered by pRPC.
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link
            href="https://docs.xandeum.network"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Docs
          </Link>
          <Link
            href="https://discord.gg/uqRSmmM5m"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Discord
          </Link>
          <Link
            href="https://github.com/Xandeum"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
