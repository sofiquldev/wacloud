/**
 * Light civic-themed wrapper for authenticated console pages.
 */
export default function ConsolePageShell({ title, description, children, wide = false }) {
    return (
        <div className={`mx-auto w-full space-y-6 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
            {(title || description) && (
                <header>
                    {title && (
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h1>
                    )}
                    {description && (
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    )}
                </header>
            )}
            {children}
        </div>
    );
}
