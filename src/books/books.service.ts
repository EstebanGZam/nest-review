import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  // Crear libro
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  // Obtener todos los libros
  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  // Obtener libros disponibles (no vendidos)
  async findAvailable(): Promise<Book[]> {
    return this.bookRepository.find({
      where: { isSold: false },
    });
  }

  // Obtener libro por ID
  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  // Buscar libros por autor
  async findByAuthor(author: string): Promise<Book[]> {
    return this.bookRepository.find({
      where: { author },
    });
  }

  // Actualizar libro
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    Object.assign(book, updateBookDto);

    return this.bookRepository.save(book);
  }

  // Eliminar libro
  async remove(id: string): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  // Comprar libro (marcar como vendido)
  async buyBook(id: string, userId: string): Promise<Book> {
    const book = await this.findOne(id);

    if (book.isSold) {
      throw new NotFoundException(`Book ${book.title} is already sold`);
    }

    book.isSold = true;
    book.soldTo = userId;

    return this.bookRepository.save(book);
  }
}
