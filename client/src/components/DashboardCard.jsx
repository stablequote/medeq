import { Card, Text, Group, Button, ThemeIcon } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { useTranslation } from 'react-i18next';

function DashboardCard({ text, number }) {
  const { t } = useTranslation()
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: 300 }}>
      <Group align="center" spacing="md">
        <ThemeIcon size={50} radius="xl" variant="light" color="blue">
          <IconUsers size={32} />
        </ThemeIcon>
        <div>
          <Text size="sm" weight={500} color="gray">
            {text}
          </Text>
          <Text size="xl" weight={700}>
            {number}
          </Text>
        </div>
      </Group>
      <Button variant="subtle" color="green" fullWidth mt="md">
      {t("Show-Details")}
      </Button>
    </Card>
  );
}
export default DashboardCard;