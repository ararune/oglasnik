# Generated by Django 5.0.6 on 2024-06-23 14:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oglasnik', '0008_alter_pregled_unique_together'),
    ]

    operations = [
        migrations.AddField(
            model_name='oglas',
            name='status',
            field=models.CharField(choices=[('aktivan', 'Aktivan'), ('neaktivan', 'Neaktivan')], default='aktivan', max_length=10),
        ),
    ]
