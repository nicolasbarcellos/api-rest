interface SendVerificationEmailParams {
    to: string;
    name: string;
    code: string;
}
export declare function sendVerificationEmail({ to, name, code }: SendVerificationEmailParams): Promise<void>;
export {};
//# sourceMappingURL=sendEmail.d.ts.map