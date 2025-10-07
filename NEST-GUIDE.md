# 🎯 RESUMEN FINAL PARA TU EXAMEN

## **LO MÁS IMPORTANTE: COMANDOS NEST CLI**

### **Estructura básica del proyecto**
```bash
# Crear proyecto
nest new nombre-proyecto

# Crear módulo, servicio y controlador (SIEMPRE en este orden)
nest g mo nombre
nest g s nombre --no-spec
nest g co nombre --no-spec

# Crear DTOs
nest g cl nombre/dto/create-nombre.dto --no-spec --flat
nest g cl nombre/dto/update-nombre.dto --no-spec --flat

# Crear Guard
nest g gu auth/guards/jwt-auth --no-spec --flat

# Crear Decorador
nest g d auth/decorators/nombre --no-spec --flat
```

**⚠️ Banderas importantes:**
- `--no-spec`: No crea archivos de test
- `--flat`: No crea subcarpeta adicional
- `--dry-run` o `-d`: Simula sin crear (para verificar)

---

## **ORDEN DE IMPLEMENTACIÓN (CRÍTICO PARA EL EXAMEN)**

### **1. Setup inicial**
```bash
# Instalar dependencias
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

### **2. Configurar .env**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=nombre_db
JWT_SECRET=tu_secret_super_seguro
PORT=3000
```

### **3. Configurar app.module.ts**
```typescript
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: true,
  }),
  AuthModule,
  TuModule,
]
```

### **4. Configurar main.ts (ValidationPipe)**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

---

## **ESTRUCTURA DE UN MÓDULO COMPLETO**

```
src/
├── nombre/
│   ├── dto/
│   │   ├── create-nombre.dto.ts    // Con validaciones
│   │   └── update-nombre.dto.ts    // Con @IsOptional()
│   ├── entities/
│   │   └── nombre.entity.ts        // Con decoradores TypeORM
│   ├── nombre.controller.ts        // Rutas HTTP
│   ├── nombre.module.ts            // Registra todo
│   └── nombre.service.ts           // Lógica de negocio
```

---

## **PATRONES CLAVE PARA CADA ARCHIVO**

### **Entity (TypeORM)**
```typescript
@Entity('nombre_tabla')
export class Nombre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  campo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column('bool', { default: false })
  activo: boolean;
}
```

### **DTO con validaciones**
```typescript
export class CreateDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsEmail()
  email: string;

  @IsOptional()  // Solo en UpdateDto
  campo?: string;
}
```

### **Service (Lógica de negocio)**
```typescript
@Injectable()
export class NombreService {
  constructor(
    @InjectRepository(Entidad)
    private readonly repo: Repository<Entidad>,
  ) {}

  async create(dto: CreateDto): Promise<Entidad> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async findAll(): Promise<Entidad[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Entidad> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Not found`);
    return item;
  }

  async update(id: string, dto: UpdateDto): Promise<Entidad> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException();
  }
}
```

### **Controller (Rutas)**
```typescript
@Controller('nombre')
@UseGuards(JwtAuthGuard)  // Proteger todas las rutas
export class NombreController {
  constructor(private readonly service: NombreService) {}

  @Post()
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### **Module (Configuración)**
```typescript
@Module({
  controllers: [NombreController],
  providers: [NombreService],
  imports: [
    TypeOrmModule.forFeature([Entidad]),
    AuthModule,  // Si necesitas proteger rutas
  ],
  exports: [NombreService],  // Si otros módulos lo necesitan
})
export class NombreModule {}
```

---

## **AUTENTICACIÓN JWT (SI LO PIDEN)**

### **Archivos críticos:**

1. **Entity User** con `@Column('text', { select: false })` para password
2. **JWT Strategy** en `strategies/jwt.strategy.ts`
3. **JWT Guard** que extiende `AuthGuard('jwt')`
4. **Decorador GetUser** para extraer usuario del request
5. **AuthModule** con `JwtModule.registerAsync()`

### **AuthService pattern:**
```typescript
// Registro
const hashedPassword = await bcrypt.hash(password, 10);
const user = await this.usersService.create({ ...dto, password: hashedPassword });
const token = this.jwtService.sign({ user_id: user.id });

// Login
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) throw new UnauthorizedException();
```

---

## **DECORADORES MÁS USADOS**

### **Validaciones (class-validator)**
```typescript
@IsString()
@IsNumber()
@IsEmail()
@IsBoolean()
@IsOptional()
@IsPositive()
@MinLength(n)
@IsUUID()
```

### **TypeORM**
```typescript
@Entity('tabla')
@PrimaryGeneratedColumn('uuid')
@Column('text')
@Column('decimal', { precision: 10, scale: 2 })
@Column('bool', { default: false })
@Column('text', { unique: true })
@Column('text', { select: false })
@Column('text', { array: true, default: [] })
```

### **NestJS**
```typescript
@Controller('ruta')
@Get() @Post() @Patch() @Put() @Delete()
@Get(':id')
@Param('id')
@Body()
@Query('campo')
@UseGuards(JwtAuthGuard)
```

---

## **ERRORES COMUNES A EVITAR**

❌ No registrar el módulo en `app.module.ts`  
❌ Olvidar `TypeOrmModule.forFeature([Entity])` en el módulo  
❌ No usar `@InjectRepository()` en el servicio  
❌ Olvidar `@IsOptional()` en UpdateDto  
❌ No validar con `if (!item) throw new NotFoundException()`  
❌ No importar `AuthModule` si usas `JwtAuthGuard`  
❌ Olvidar las dependencias en el constructor  

---

## **CHECKLIST PARA EL EXAMEN**

✅ Levantar Docker con PostgreSQL  
✅ Crear .env con todas las variables  
✅ Configurar app.module.ts y main.ts  
✅ Por cada módulo: entity → dto → service → controller → module  
✅ Registrar cada módulo en app.module.ts  
✅ Si piden auth: users + auth completo primero  
✅ Proteger rutas con `@UseGuards(JwtAuthGuard)`  
✅ Probar cada endpoint con token válido  

---

## **TIP FINAL 🔥**

El profesor dará **tests**. Lee los tests primero para entender:
- Qué rutas crear
- Qué validaciones necesitas
- Qué campos debe tener cada entity
- Qué métodos debe tener cada service

**¡Mucha suerte en tu examen! 🚀 Tienes todo lo necesario.**