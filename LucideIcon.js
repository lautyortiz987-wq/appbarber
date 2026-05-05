window.LucideIcon = ({ name, size = 16, className = '' }) => {
    const lib = window.LucideReact || {};
    const pascal = name
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    const Comp = lib[pascal];
    if (!Comp) return <span style={{ display: 'inline-block', width: size, height: size }} />;
    return <Comp size={size} className={className} />;
};
