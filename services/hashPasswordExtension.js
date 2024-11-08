

const { Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');

module.exports = Prisma.defineExtension({
    name: 'hashPassword',
    query: {
        utilisateur: {
            create: async ({ args, query }) => {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!,%*?&])[A-Za-z\d@$!,%*?&]{8,}$/;

                // Validation du mot de passe avec regex
                if (!passwordRegex.test(args.data.password)) {
                    throw ({ password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre, et un caractère spécial parmi : @$!,%*?&." });
                }

                try {
                    // Hachage du mot de passe
                    const hash = await bcrypt.hash(args.data.password, 10);
                    args.data.password = hash;
                    return query(args);
                } catch (error) {
                    res.render('pages/signIn.twig', {
                        error: error
                    })
                }
            }
            // ,
            // password: {
            //     update: async ({ args, query }) => {
            //         const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!,%*?&])[A-Za-z\d@$!,%*?&]{8,}$/;

            //         // Validation du mot de passe avec regex
            //         if (!passwordRegex.test(args.data.password)) {
            //             throw ({ password: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre, et un caractère spécial parmi : @$!,%*?&." });
            //         }
            //         try {
            //             // Hachage du mot de passe
            //             const hash = await bcrypt.hash(args.data.password, 10);
            //             args.data.password = hash;
            //             return query(args);
            //         } catch (error) {
            //             res.render('pages/resetPassword.twig', {
            //                 error: error
            //             })
            //         }
            //     }
            // }

        }
    }
});
