# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
import uuid
from django.utils import timezone

class Zupanija(models.Model):
    naziv = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = 'Zupanije'
        verbose_name_plural = 'Zupanije'
        
    def __str__(self):
        return self.naziv

class Grad(models.Model):
    zupanija = models.ForeignKey(Zupanija, on_delete=models.CASCADE)
    naziv = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Grad'
        verbose_name_plural = 'Gradovi'

    def __str__(self):
        return self.naziv

class Korisnik(AbstractUser):
    oib = models.CharField(max_length=11, null=True, validators=[RegexValidator(r'^\d{11}$', message='OIB mora imati 11 znamenki')])
    zupanija = models.ForeignKey(Zupanija, on_delete=models.CASCADE, null=True)
    grad = models.ForeignKey(Grad, on_delete=models.SET_NULL, null=True)
    telefon = models.CharField(max_length=12, null=True, blank=True, validators=[RegexValidator(r'^\d{6,12}$', message='Telefon mora imati između 6 i 12 znamenki')])

    class Meta:
        verbose_name = 'Korisnik'
        verbose_name_plural = 'Korisnici'

    def __str__(self):
        return self.username
    
class Kategorija(models.Model):
    naziv = models.CharField(max_length=100)
    roditelj = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    url = models.CharField(max_length=100, unique=True, null=True, blank=True)

    class Meta:
        verbose_name = 'Kategorija'
        verbose_name_plural = 'Kategorije'

    def __str__(self):
        return self.naziv

class Oglas(models.Model):
    IZBOR_TRAJANJA = [
        (1, '1 dan'),
        (7, '1 tjedan'),
        (30, '1 mjesec'),
    ]
    STATUS_IZBORI = [
        ('aktivan', 'Aktivan'),
        ('neaktivan', 'Neaktivan'),
        ('arhiviran', 'Arhiviran')
    ]
    def generiraj_sifru():
        while True:
            sifra = str(uuid.uuid4().int)[:8]
            if not Oglas.objects.filter(sifra=sifra).exists():
                return sifra

    cijena = models.DecimalField(max_digits=10, decimal_places=2)
    sifra = models.CharField(default=generiraj_sifru, editable=False, unique=True, max_length=8)
    naziv = models.CharField(max_length=255)
    opis = models.TextField()
    korisnik = models.ForeignKey(Korisnik, on_delete=models.CASCADE)
    zupanija = models.ForeignKey(Zupanija, on_delete=models.CASCADE)
    grad = models.ForeignKey(Grad, on_delete=models.CASCADE)
    trajanje = models.IntegerField(choices=IZBOR_TRAJANJA)
    kategorija = models.ForeignKey(Kategorija, on_delete=models.CASCADE, null=True)
    datum = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_IZBORI, default='aktivan')

    class Meta:
        verbose_name = 'Oglas'
        verbose_name_plural = 'Oglasi'

    def __str__(self):
        return self.naziv

class Pregled(models.Model):
    oglas = models.ForeignKey(Oglas, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('oglas', 'ip_address', 'timestamp')
        verbose_name = 'Pregled'
        verbose_name_plural = 'Pregledi'
        
class Slika(models.Model):
    oglas = models.ForeignKey(Oglas, on_delete=models.CASCADE, related_name='slike')
    slika = models.ImageField(upload_to='slike/')

    class Meta:
        verbose_name = 'Slika'
        verbose_name_plural = 'Slike'
    def __str__(self):
        return f"Slika za {self.oglas.naziv}"

class Favorit(models.Model):
    korisnik = models.ForeignKey(Korisnik, on_delete=models.CASCADE, related_name='favoriti')
    oglas = models.ForeignKey(Oglas, on_delete=models.CASCADE, related_name='favoriti')
    datum = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('korisnik', 'oglas')
        verbose_name = 'Favorit'
        verbose_name_plural = 'Favoriti'

    def __str__(self):
        return f"{self.korisnik.username} - {self.oglas.naziv}"
    
class Komentar(models.Model):
    korisnik = models.ForeignKey(Korisnik, related_name='komentari', on_delete=models.CASCADE)
    autor = models.ForeignKey(Korisnik, related_name='napisani_komentari', on_delete=models.CASCADE)
    tekst = models.CharField(max_length=150)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Komentar'
        verbose_name_plural = 'Komentari'
        ordering = ['-timestamp']

    def __str__(self):
        return f'Komentar od {self.autor.username} za {self.korisnik.username}'