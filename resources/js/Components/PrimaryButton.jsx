const variantClass = {
    default:
        'rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300',
    civic: 'rounded-lg border border-transparent bg-civic px-4 py-2.5 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90 focus:outline-none focus:ring-2 focus:ring-civic/40 focus:ring-offset-2 focus:ring-offset-background active:bg-civic',
    admin: 'rounded-lg border border-transparent bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-800 active:bg-slate-200',
};

export default function PrimaryButton({
    className = '',
    variant = 'default',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center ${
                    variantClass[variant] ?? variantClass.default
                } ${disabled ? 'opacity-25' : ''} ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
