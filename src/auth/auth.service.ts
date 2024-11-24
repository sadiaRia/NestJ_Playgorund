import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signin(dto: AuthDto) {
    //find the user by email

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new ForbiddenException('Credentials exception');
    }
    //if user does not exist throw exception

    const pwMatches = await argon.verify(user.hash, dto.password);

    //compare passwords

    if (!pwMatches) {
      throw new ForbiddenException('Credentials Incorrect');
    }
    //if password incorrect throe exception
    delete user.hash;
    //send back user
    return user;

    return { msg: 'signin' };
  }

  async signup(dto: AuthDto) {
    //generate the password  hash
    const hash = await argon.hash(dto.password);

    //save the user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      //return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
}
