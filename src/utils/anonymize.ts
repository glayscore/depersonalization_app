import crypto from 'crypto';

export const anonymize = (data: string) => {
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
};
