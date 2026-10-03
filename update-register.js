const fs = require('fs');
let code = fs.readFileSync('src/app/(auth)/register/page.tsx', 'utf8');

code = code.replace(/import \{ Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight \} from 'lucide-react'/, 
  'import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight } from \'lucide-react\'');

code = code.replace(/const \[email, setEmail\] = useState\(''\)/, 
  'const [email, setEmail] = useState(\'\')\n  const [phone, setPhone] = useState(\'\')');

code = code.replace(/body: JSON.stringify\(\{ name, email, password \}\),/, 
  'body: JSON.stringify({ name, email, phone, password }),');

const emailDivRegex = /<div className="relative">\s*<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 h-5 w-5 text-zinc-500" \/>\s*<Input\s*type="email"\s*placeholder="Email address"\s*value=\{email\}\s*onChange=\{\(e\) => setEmail\(e\.target\.value\)\}\s*required\s*className="pl-10 bg-zinc-900\/50 border-white\/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500\/50 h-12"\s*\/>\s*<\/div>\s*<\/div>/;

const phoneDiv = `<div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                type="tel"
                placeholder="Phone number (e.g. +919876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="pl-10 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/50 h-12"
              />
            </div>
          </div>`;

code = code.replace(emailDivRegex, match => match + '\n\n          ' + phoneDiv);

fs.writeFileSync('src/app/(auth)/register/page.tsx', code);
console.log('Register page updated');
