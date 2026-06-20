export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-20 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground font-heading">
        MCG UTM
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-8 leading-relaxed">
        A digital sanctuary and modern gallery for the Mandarin Care Group.
      </p>
      <div className="w-full max-w-5xl aspect-video bg-muted/30 rounded-xl border border-border/50 flex items-center justify-center">
        <span className="text-muted-foreground text-sm uppercase tracking-widest">
          High Quality Group Photo Placeholder
        </span>
      </div>
    </div>
  );
}
