import multer from 'multer'
import {fileTypeFromBuffer} from 'file-type'
import {resolve} from 'path'
import {mkdir, readFile, unlink, writeFile} from 'fs/promises'
import { randomUUID } from 'crypto'
import { BadRequestException } from '../../exception'
import { MulterRequest } from '../../interface'
import { StorageApproachEnum } from '../../enum'
import { tmpdir } from 'os'

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    files: ["application/pdf", "application/json"]
}


//di js method ali rag3 mnha multer instance function (bthandle almulter w alfile size)
export const localFileUpload = ({maxFileSize = 5,storageApproach=StorageApproachEnum.MEMORY}:{maxFileSize?:number,storageApproach?:StorageApproachEnum}) => {
    const storage = storageApproach == StorageApproachEnum.MEMORY?  multer.memoryStorage() : multer.diskStorage({
        destination(req, file, callback) {
            callback(null,tmpdir())
        },
        filename(req, file, callback) {
            callback(null, randomUUID()+file.originalname)
        },
    })
    return multer({storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}



//di ro7 almshro3 bt3ml process w bt5zn alfile f alpath w kol 7aga 
export const processFile = async ({customPath = "general", file, validation}:{customPath?:string, file:Express.Multer.File, validation:string[] }) => {
    if(file.path){
        file.buffer = await readFile(file.path)
    }
    const result = await fileTypeFromBuffer(file.buffer)
    if (!result || !validation.includes(result.mime)) {
        await unlink(file.path)
        throw new BadRequestException("Invalid file formats")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), {recursive:true}) //law msh mwgod e3mlo creation 8er kda kml
        const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
        if(file.path){
            await unlink(file.path)
        }
        file.path = uniqueFilePath
        return file
    }
}



//b3ed est5dam processFile feha lma brf3 aktr mn file
export const processFiles = async ({customPath="general", files, validation}:{customPath?:string, files:Express.Multer.File[], validation:string[] }) => {
    const validatedFiles = []
    // hy3ml validate 3al7aga ali d5lalo alawl
    for (const file of files) {
        const result = await fileTypeFromBuffer(file.buffer)
        if (!result || !validation.includes(result.mime)) {
            throw new BadRequestException("Invalid file formats")
        }
        validatedFiles.push({file, result})
    }

    // law kolo tmm w 3da mn ali fo2 ybd2 b2a y5zn f assets
    const assets = []
    for (const { file, result } of validatedFiles) {
        const uniqueFilePath = `${customPath}/${randomUUID()}.${result.ext}`;
        await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
        await writeFile(resolve(`./assets/${uniqueFilePath}`), file.buffer);
        file.path = `assets/${uniqueFilePath}`;
        assets.push(file);
    }
    return assets
}



//b3ed est5dam processFile feha lma brf3 aktr mn file ka fields (obj of array)
export const processFields = async ({customPath="general", fields, validation}:{customPath?:string, fields:Record<string,Express.Multer.File[]>, validation:string[] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        for (const file of fields[field] as Express.Multer.File[]) {
            const result = await fileTypeFromBuffer(file.buffer)
            if (!result || !validation.includes(result.mime)) {
                throw new BadRequestException("Invalid file formats")
            }
        }
    }

    for (const field of Object.keys(fields)) {
        const files = await processFiles({customPath, files: fields[field] as Express.Multer.File[],validation})
        assets.push({ field, files })
    }
    return assets
}



//di bt3ml customization b eni hcall anhy wa7da mn ali fo2 
export const processMulterUpload = async ({req, customPath = "general", validation = [] }:{req:MulterRequest, customPath?:string, validation:string[] }) => {
    if (req.file) {
        await processFile({customPath, file: req.file, validation })
    }
    else if (Array.isArray(req.files)) {
        await processFiles({customPath, files: req.files, validation })
    }
    else if (typeof req.files == "object" && Object.keys(req.files ?? {})?.length){
        await processFields({customPath, fields: req.files, validation })
    }    
}



