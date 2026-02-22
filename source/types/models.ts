export type Provider = {
	id: string;
	name: string;
	env?: string[];
};

export type Model = {
	id: string;
	name: string;
	providerId: string;
	family?: string;
	context?: number;
	outputLimit?: number;
	costInput?: number;
	costOutput?: number;
	capabilities?: {
		toolCall?: boolean;
		vision?: boolean;
		streaming?: boolean;
	};
};

export type ModelsData = {
	providers: Provider[];
	models: Model[];
};
