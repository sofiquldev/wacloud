import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const variantClass = {
    default:
        'rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25',
    civic: 'rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25',
    admin: 'rounded-lg border border-slate-600 bg-slate-950/90 px-3 py-2.5 text-sm text-slate-100 shadow-inner transition-colors placeholder:text-slate-500 focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/35',
    settings:
        'rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25',
};

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        variant = 'default',
        isFocused = false,
        ...props
    },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={`${variantClass[variant] ?? variantClass.default} ` + className}
            ref={localRef}
        />
    );
});
