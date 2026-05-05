setTimeout(() => {
    const keys = Object.keys(window.lucide || {});
    const ejemplo = window.lucide[keys[0]];
    console.log('[Lucide] Primera key:', keys[0]);
    console.log('[Lucide] Estructura:', JSON.stringify(ejemplo));
}, 500);

window.LucideIcon = ({ name, size = 16, className = '' }) => {
    const pascal = name
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

    const iconData = window.lucide && window.lucide[pascal];

    if (!iconData) return React.createElement('span', {
        style: { display: 'inline-block', width: size, height: size }
    });

    const [, , children] = iconData;

    const svgChildren = (children || []).map(([tag, childAttrs], i) =>
        React.createElement(tag, { key: i, ...childAttrs })
    );

    return React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className
    }, ...svgChildren);
};
