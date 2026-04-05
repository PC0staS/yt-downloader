export namespace main {
	
	export class DownloadRequest {
	    url: string;
	    audioOnly: boolean;
	    quality: string;
	    downloadPath: string;
	
	    static createFrom(source: any = {}) {
	        return new DownloadRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.audioOnly = source["audioOnly"];
	        this.quality = source["quality"];
	        this.downloadPath = source["downloadPath"];
	    }
	}
	export class DownloadResponse {
	    success: boolean;
	    message: string;
	    filename?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new DownloadResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.filename = source["filename"];
	        this.error = source["error"];
	    }
	}
	export class Job {
	    id: string;
	    url: string;
	    title: string;
	    status: string;
	    progress: number;
	    message: string;
	    error?: string;
	    // Go type: time
	    startTime: any;
	    // Go type: time
	    endTime?: any;
	
	    static createFrom(source: any = {}) {
	        return new Job(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.title = source["title"];
	        this.status = source["status"];
	        this.progress = source["progress"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.startTime = this.convertValues(source["startTime"], null);
	        this.endTime = this.convertValues(source["endTime"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

