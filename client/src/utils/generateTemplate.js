export function generateTemplate(item, marketplace, price) {
  const displayPrice = price || item.estimatedPrice;
  const tags = item.tags?.map(t => `#${t.tag.name}`).join(' ') || '';

  if (marketplace.slug === 'depop') {
    return [
      item.title,
      '',
      item.description || '',
      '',
      item.brand    ? `${item.brand}` : null,
      item.size     ? `size ${item.size}` : null,
      item.color    ? `${item.color}` : null,
      item.material ? `${item.material}` : null,
      item.condition?.replace(/_/g, ' ') || null,
      '',
      displayPrice  ? `$${Number(displayPrice).toFixed(2)} — dm to bundle 💌` : null,
      '',
      tags,
    ].filter(l => l !== null).join('\n').trim();
  }

  return [
    item.title,
    '',
    item.description || '',
    '',
    item.brand     ? `Brand: ${item.brand}`                              : null,
    item.size      ? `Size: ${item.size}`                                : null,
    item.color     ? `Color: ${item.color}`                              : null,
    item.material  ? `Material: ${item.material}`                        : null,
    item.condition ? `Condition: ${item.condition.replace(/_/g, ' ')}` : null,
    '',
    displayPrice   ? `Price: $${Number(displayPrice).toFixed(2)}`        : null,
    '',
    tags,
  ].filter(l => l !== null).join('\n').trim();
}