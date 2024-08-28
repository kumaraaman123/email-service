class EmailService {
    constructor() {
        this.providers = [this.mockProviderA, this.mockProviderB];
        this.currentProviderIndex = 0;
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.backoffFactor = 2;
        this.rateLimit = 1000; 
        this.lastSendTime = 0;
        this.sentEmails = new Set(); 
    }

    // Mock email provider A
    async mockProviderA(email) {
        if (Math.random() > 0.5) {
            return { success: true, provider: 'A' };
        } else {
            throw new Error('Provider A failed');
        }
    }

    // Mock email provider B
    async mockProviderB(email) {
        if (Math.random() > 0.5) {
            return { success: true, provider: 'B' };
        } else {
            throw new Error('Provider B failed');
        }
    }

    async sendEmail(email) {
        const now = Date.now();
        if (now - this.lastSendTime < this.rateLimit) {
            throw new Error('Rate limit exceeded');
        }

        this.lastSendTime = now;
        if (this.sentEmails.has(email.id)) {
            throw new Error('Email already sent');
        }

        this.sentEmails.add(email.id);
        let attempt = 0;
        let result;

        while (attempt < this.maxRetries) {
            try {
                result = await this.trySendingEmail(email);
                if (result.success) {
                    console.log(`Email sent successfully using provider ${result.provider}`);
                    return result;
                }
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            }

            attempt++;
            if (attempt < this.maxRetries) {
                const delay = Math.pow(this.backoffFactor, attempt) * 1000;
                await this.sleep(delay);
            }
        }

        throw new Error('Failed to send email after multiple attempts');
    }

    async trySendingEmail(email) {
        let provider = this.providers[this.currentProviderIndex];
        try {
            return await provider.call(this, email);
        } catch (error) {
            console.error(`Provider ${this.currentProviderIndex} failed: ${error.message}`);
            this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
            provider = this.providers[this.currentProviderIndex];
            return await provider.call(this, email);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = EmailService;
