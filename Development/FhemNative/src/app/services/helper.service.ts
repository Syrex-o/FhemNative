import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class HelperService {
	// finder function for returning array item for array of objects
	public find(array, key, value) {
		for (let i = 0; i < array.length; i++) {
	    	if (array[i][key] === value) {
	        	return {
	        		item: array[i],
	        		index: i
	        	};
	      	}
	    }
	 return null;
	}

	public testJSON(str) {
		try { JSON.parse(str); } catch (e) { return false; }
		return true;
	}

	public UIDgenerator() {
		return '_' + Math.random().toString(36).substr(2, 9);
	}

	public checkValidHex(str){
		return (/^#([0-9A-F]{3}){1,2}$/i).test(str);
	}
}
