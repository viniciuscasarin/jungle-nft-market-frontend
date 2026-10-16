import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/dKMJKBVdX6q0Ym4OX5vd3V?node-id=I70485:382;70485:323',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="todos" className="max-w-md">
      <TabsList>
        <TabsTrigger value="todos">Todos</TabsTrigger>
        <TabsTrigger value="artes">Artes</TabsTrigger>
        <TabsTrigger value="jogos">Jogos</TabsTrigger>
        <TabsTrigger value="colecionaveis">Colecionáveis</TabsTrigger>
      </TabsList>
      <TabsContent value="todos" className="p-4 text-body-14 text-text-secondary">
        Exibindo todos os 120 NFTs cadastrados no catálogo.
      </TabsContent>
      <TabsContent value="artes" className="p-4 text-body-14 text-text-secondary">
        Exibindo 45 artes digitais exclusivas.
      </TabsContent>
      <TabsContent value="jogos" className="p-4 text-body-14 text-text-secondary">
        Exibindo 32 itens de jogos e metaverso.
      </TabsContent>
      <TabsContent value="colecionaveis" className="p-4 text-body-14 text-text-secondary">
        Exibindo 43 itens colecionáveis raros.
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const artesTab = canvas.getByRole('tab', { name: 'Artes' });
    await expect(artesTab).toBeInTheDocument();
    await userEvent.click(artesTab);
    const content = await canvas.findByText(/45 artes digitais/i);
    await expect(content).toBeInTheDocument();
  },
};
