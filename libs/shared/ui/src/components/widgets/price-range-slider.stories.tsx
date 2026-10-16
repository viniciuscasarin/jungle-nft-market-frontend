import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { PriceRangeSlider } from './price-range-slider';

function PriceRangeSliderDemo() {
  const [range, setRange] = useState<[number, number]>([0.5, 5.0]);
  return (
    <div className="max-w-xs p-4 bg-surface-card rounded-lg border border-border-default">
      <PriceRangeSlider min={0} max={10} step={0.1} value={range} onChange={setRange} />
    </div>
  );
}

const meta: Meta<typeof PriceRangeSlider> = {
  title: 'Widgets/PriceRangeSlider',
  component: PriceRangeSlider,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=4:166',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PriceRangeSlider>;

export const Default: Story = {
  render: () => <PriceRangeSliderDemo />,
};
