import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=70493:2519',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Detalhes da Coleção</CardTitle>
        <CardDescription>Jungle Animals Genesis Collection</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-14 text-text-secondary">
          Coleção exclusiva com 100 itens colecionáveis renderizados em alta fidelidade.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" size="sm">Explorar Itens</Button>
      </CardFooter>
    </Card>
  ),
};

export const Raised: Story = {
  render: () => (
    <Card variant="raised" className="max-w-md">
      <CardHeader>
        <CardTitle>Painel Elevado</CardTitle>
        <CardDescription>Superfície com contraste aprimorado</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-14 text-text-secondary">
          Ideal para widgets de checkout, estatísticas e resumo de transações.
        </p>
      </CardContent>
    </Card>
  ),
};
