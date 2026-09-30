import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "react-email";

export type ActionEmailProps = {
  lang: string;
  preview: string;
  heading: string;
  body: string;
  cta: string;
  url: string;
  footnote: string;
  footer: string;
};

const colors = { text: "#171717", muted: "#737373", border: "#e5e5e5" };

/** Email with a single call to action (verify email, reset password…). Texts arrive translated. */
export function ActionEmail({
  lang,
  preview,
  heading,
  body,
  cta,
  url,
  footnote,
  footer,
}: ActionEmailProps) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", color: colors.text }}>
        <Container style={{ maxWidth: 480, padding: 24 }}>
          <Heading as="h1" style={{ fontSize: 22 }}>
            {heading}
          </Heading>
          <Text style={{ fontSize: 15, lineHeight: "24px" }}>{body}</Text>
          <Button
            href={url}
            style={{
              background: colors.text,
              color: "#ffffff",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 14,
            }}
          >
            {cta}
          </Button>
          <Text style={{ fontSize: 13, color: colors.muted }}>{footnote}</Text>
          <Hr style={{ borderColor: colors.border }} />
          <Text style={{ fontSize: 12, color: colors.muted }}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Preview (`pnpm email:dev`) only
ActionEmail.PreviewProps = {
  lang: "es",
  preview: "Confirma tu email",
  heading: "Confirma tu email",
  body: "Pulsa el botón para verificar tu dirección de email.",
  cta: "Verificar email",
  url: "http://localhost:3000",
  footnote: "Si no has sido tú, ignora este mensaje.",
  footer: "JR Next Starter",
} satisfies ActionEmailProps;

export default ActionEmail;
