export class ApplicationException extends Error {
    constructor(message: string, public status: number, cause?: unknown) {
        super(message, { cause });
        this.name = this.constructor.name //3shan string ay no3 error yzhr (badreq - notfound...)
        Error.captureStackTrace(this,this.constructor) //di bttrace mkan alerror w trg3li path alerror
    }
}




// //da clean code w di alas7 w ali fo2 msh 8lt bardo w ashl
// export class ApplicationException extends Error {
//     constructor(override message: string, public status: number, override cause?: unknown) {
//         super();
//         this.name = this.constructor.name;
//         Error.captureStackTrace(this, this.constructor);
//     }
// }

// class Parent {
//     constructor(public name?: string) {}
// }

// class Child extends Parent {
//     constructor(override name: string) {
//         super(name);
//     }
// }

// const c = new Child("Ali");
// console.log(c);