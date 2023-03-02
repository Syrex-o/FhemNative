import { v4 as uuidv4 } from 'uuid'; 

export function getUID(): string {
	return uuidv4();
}