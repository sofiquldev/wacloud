import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

/**
 * Inline label + input + action button row used across console forms.
 */
export default function ConsoleFormRow({
    children,
    onSubmit,
    processing = false,
    buttonLabel,
    buttonDisabled,
    className = '',
}) {
    return (
        <form
            onSubmit={onSubmit}
            className={`flex flex-col gap-3 sm:flex-row sm:items-stretch ${className}`}
        >
            <div className="min-w-0 flex-1">{children}</div>
            {buttonLabel ? (
                <PrimaryButton
                    type="submit"
                    variant="civic"
                    disabled={processing || buttonDisabled}
                    className="shrink-0 px-5 py-2.5 sm:self-end"
                >
                    {buttonLabel}
                </PrimaryButton>
            ) : null}
        </form>
    );
}

export function ConsoleTextInput(props) {
    return (
        <TextInput
            variant="civic"
            className={`block w-full ${props.className ?? ''}`}
            {...props}
        />
    );
}
