import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap pt-24 flex flex-col gap-6">
      <p className="mono text-muted m-0">404 · No signal</p>
      <h1 className="disp m-0 text-white" style={{ fontSize: "clamp(36px,4.5vw,64px)" }}>
        Nothing here
      </h1>
      <Link className="mono" href="/archive">
        See everything →
      </Link>
    </section>
  );
}
